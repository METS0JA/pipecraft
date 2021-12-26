#!/bin/bash

# Demultiplex SINGLE-END reads.
# Demultiplexing of single-end reads in mixed orientation using paired-end or single-end indexes is supported.
# Input = a directory with fastq/fasta files; and indexes file in fasta format (header as a sample name).
# Examples of indexes format in "indexes_file_example.txt"

##########################################################
###Third-party applications:
#cutadapt v3.5
    #citation: Martin, Marcel (2011) Cutadapt removes adapter sequences from high-throughput sequencing reads. EMBnet.journal, 17(1), 10-12.
    #Distributed under the MIT license
    #https://cutadapt.readthedocs.io/en/stable/index.html
#seqkit v2.0.0
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
#pigz v2.4
##################################################################

#Load variables
regex='[^/]*$'
oligos_file_path=$(echo $index_file | grep -oP "$regex")
oligos_file=$(basename $oligos_file_path) #basename, needed for macOS
indexes_file=$(printf "/extraFiles/$oligos_file")
extension=$fileFormat
error_rate="-e ${index_mismatch}"
if [ "$no_indels" = true ] ; then
    no_indels=$"--no-indels"
else
    no_indels=''
minlen=$"--minimum-length ${min_seq_length}"
cores=$"--cores ${cores}"
overlap=$"--overlap ${overlap}"
###############################
###############################

# Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/demultiplex_out"

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env
### Check barcodes file
check_indexes_file

### Process file
printf "Checking files ...\n"
for file in *.$extension; do

    #Write file name without extension
    input=$(echo $file | sed -e "s/.$extension//")

    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_SE
    ### Check input formats (fastq/fasta supported)
    check_extension_fastx

    ### Check if dual indexes or single indexes and prepare workflow accordingly
    if grep -q "\..." tempdir2/ValidatedBarcodesFileForDemux.fasta.temp; then
        #dual indexes
        #make rev indexes file
        seqkit seq --quiet -n tempdir2/ValidatedBarcodesFileForDemux.fasta.temp | \
        sed -e 's/^/>/' > tempdir2/paired_barcodes_headers.temp
        grep "\..." tempdir2/ValidatedBarcodesFileForDemux.fasta.temp | \
        awk 'BEGIN{FS="."}{print $4}' > tempdir2/paired_barcodes_seq.temp
        touch tempdir2/barcodes_rev.fasta
        i=1
        p=$"p"
        while read HEADER; do
            echo $HEADER >> tempdir2/barcodes_rev.fasta
            sed -n $i$p tempdir2/paired_barcodes_seq.temp >> tempdir2/barcodes_rev.fasta
            i=$((i + 1))
        done < tempdir2/paired_barcodes_headers.temp
        #make fwd indexes file
        sed -e 's/\.\.\..*//' < tempdir2/ValidatedBarcodesFileForDemux.fasta.temp > tempdir2/barcodes_fwd.fasta
        #reverse complementary REV indexes
        seqkit seq --quiet -t dna -r -p tempdir2/barcodes_rev.fasta > tempdir2/barcodes_rev_RC.fasta
        #Make linked indexes files where REV indexes are in RC orientation
        tr "\n" "\t" < tempdir2/barcodes_fwd.fasta | sed -e 's/>/\n>/g' | sed '/^\n*$/d' > tempdir2/barcodes_fwd.temp
        tr "\n" "\t" < tempdir2/barcodes_rev_RC.fasta | sed -e 's/>/\n>/g' | sed '/^\n*$/d' > tempdir2/barcodes_rev_RC.temp
        gawk 'BEGIN {FS=OFS="\t"} FNR==NR{a[$1]=$2;next} ($1 in a) {print $1,a[$1],$2}' tempdir2/barcodes_fwd.temp tempdir2/barcodes_rev_RC.temp > tempdir2/linked_barcodes_revRC.temp
        sed -e 's/\t/\n/' < tempdir2/linked_barcodes_revRC.temp | sed -e 's/\t/\.\.\./' > tempdir2/linked_barcodes_revRC.fasta

        #assign demux variables
        #REV indexes as 5'-3' orientation for cutadapt search 
        indexes_file_in=$"-g file:tempdir2/linked_barcodes_revRC.fasta"
        out=$"-o $output_dir/{name}.$newextension"
    else
        #single indexes
        #assign demux variables
        indexes_file_in=$"-g file:tempdir2/ValidatedBarcodesFileForDemux.fasta.temp"
        out=$"-o $output_dir/{name}.$newextension"
    fi

    ############################
    ### Start demultiplexing ###
    ############################
    printf "\n# Demultiplexing ...  \n"
    printf "   (this may take some time for large files)\n"
    ### Demultiplex with cutadapt
    checkerror=$(cutadapt --quiet \
    $indexes_file_in \
    $error_rate \
    $no_indels \
    --revcomp \
    --untrimmed-output $output_dir/unknown.$newextension \
    $overlap \
    $minlen \
    $cores \
    $out \
    $input.$newextension 2>&1)
    check_app_error
done

#Remove 'rc' string from seq if the indexes were found on reverse complementary strand
for file in $output_dir/*.$newextension; do
    gawk -i inplace '{ gsub(/ rc$/, "") }; { print }' $file
done

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
clean_and_make_stats_Assemble_Demux
end=$(date +%s)
runtime=$((end-start))

#Make README.txt file for demultiplexed reads
printf "Files in 'demultiplex_out' directory represent per sample sequence files, 
that were generated based on the specified indexes file ($indexes_file).
Data, has been demultiplexed taken into account that some sequences
may be also in reverse complementary orientation.
Sequences where reverse complementary indexes have been found 
were reverse complemented, so all the sequences are in uniform orientation in the files.\n
Sequence orientation in 'demultiplex_out' reflects the indexes orientation: i.e. 
1) if only single-end indexes have been specified, and these indexes are attached to 3'-end of a sequence,
then sequence orientation is 3'-5'.
2) if only single-end indexes have been specified, and these indexes are attached to 5'-end of a sequence,
then sequence orientation is 5'-3'.
3) if paired-end indexes have been specified (both ends of the sequence were supplemented with indexes),
and indexes in the file were specified as 5'_indexes followed by 3'_indexes (fwd_index...rev_index),
then sequence orientation is 5'-3'.\n

IF SEQUENCE YIELD PER SAMPLE IS LOW (OR ZERO), DOUBLE-CHECK THE INDEXES FORMATTING.\n
RUNNING THE PROCESS SEVERAL TIMES IN THE SAME DIRECTORY WILL OVERWRITE ALL THE OUTPUTS!
\nSummary of sequence counts in 'seq_count_summary.txt'\n
\n\nTotal run time was $runtime sec.\n\n\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#cutadapt v3.5 for demultiplexing
    #citation: Martin, Marcel (2011) Cutadapt removes adapter sequences from high-throughput sequencing reads. EMBnet.journal, 17(1), 10-12.
    #Distributed under the MIT license
    #https://cutadapt.readthedocs.io/en/stable/index.html
#seqkit v2.0.0 for validating indexes file
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
##################################################################" > $output_dir/README.txt


###Done, files in $output_dir folder
printf "\nDONE\n"
printf "Data in directory $output_dir\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt file in $output_dir for further information about the process.\n\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=/$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=demultiplexed"
echo "readType=single_end"
