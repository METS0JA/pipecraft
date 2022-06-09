#!/bin/bash

# ASSEMBLE PAIRED-END data with vsearch
# Input = paired-end fastq files. Paired-end data identifiers --> -R1 | _R1 | .R1

##########################################################
###Third-party applications:
#vsearch v2.18.0
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#pigz v2.4
##########################################################

#load variables
extension=$fileFormat
fastq_minoverlen=$"--fastq_minovlen ${min_overlap}"
fastq_minmergelen=$"--fastq_minmergelen ${min_lenght}"
fastq_allowmergestagger=$allow_merge_stagger
include_R1=$include_only_R1
fastq_maxdiffs=$"--fastq_maxdiffs ${max_diffs}"
fastq_maxns=$"--fastq_maxns ${max_Ns}"
fastq_maxmergelen="--fastq_maxmergelen ${max_len}"
fastq_qmax=$fastq_qmax
notmerged_files=$keep_disjointed

#Source for functions
source /scripts/submodules/framework.functions.sh
#output dir
output_dir=$"/input/assembled_out"

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_PE_env
### Process samples
while read LINE; do
    #Read in R1 and R2 file names; without extension
    inputR1=$(echo $LINE | sed -e "s/.$extension//")
    inputR2=$(echo $inputR1 | sed -e 's/R1/R2/')
    ## Preparing files for the process
    printf "\n____________________________________\n"
    printf "Checking $inputR1 and $inputR2 ...\n"
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_PE
    ### Check input formats (fastq supported)
    check_extension_fastq

    ########################
    ### Start assembling ###
    ########################
    fastqout=$(echo $inputR1 | sed -E 's/\.R1.*|_R1.*|-R1.*//')

    #variables for not_merged output files
    if [[ $notmerged_files == "TRUE" ]]; then
    	mkdir -p $output_dir/not_assembled_paired_end_reads
    	fastqout_notmerged_fwd="--fastqout_notmerged_fwd $output_dir/not_assembled_paired_end_reads/$inputR1.notAssembled.$newextension"
    	fastqout_notmerged_rev="--fastqout_notmerged_rev $output_dir/not_assembled_paired_end_reads/$inputR2.notAssembled.$newextension"
    fi
    if [[ $fastq_allowmergestagger == "TRUE" ]]; then
        allowmergestagger=$"--fastq_allowmergestagger"
    fi 
    #When including R1 to the assembled output, then include fastqout_notmerged_fwd (in case notmerged_files=FALSE)
    if [[ $include_R1 == "TRUE" ]]; then
        mkdir -p $output_dir/not_assembled_paired_end_reads
    	fastqout_notmerged_fwd="--fastqout_notmerged_fwd $output_dir/not_assembled_paired_end_reads/$inputR1.notAssembled.$newextension"
    fi

	checkerror=$(vsearch --quiet --fastq_mergepairs $inputR1.$newextension \
	--reverse $inputR2.$newextension \
	$fastq_minoverlen \
	$fastq_minmergelen \
	$allowmergestagger \
	$fastq_maxdiffs \
	$fastq_maxns \
	$fastq_maxmergelen \
	$fastqout_notmerged_fwd \
	$fastqout_notmerged_rev \
	--fastq_qmax $fastq_qmax \
	--fastq_qmaxout $fastq_qmax \
	--fastqout $output_dir/$fastqout.$newextension 2>&1)
    check_app_error

    #Include R1 reads to assembled data set if include_R1 = TRUE
    if [[ $include_R1 == "TRUE" ]]; then
    	printf '%s\n' "include only R1 = TRUE, including also unmerged R1 reads to the assembled output"
    	cat $output_dir/not_assembled_paired_end_reads/$inputR1.notAssembled.$newextension >> $output_dir/$fastqout.$newextension
    fi
    ### Check if assembled output is empty; if yes, then report WARNING
    if [ -s $output_dir/$fastqout.$newextension ]; then
        :
    else
        printf '%s\n' "WARNING]: after assembling, $fastqout.$newextension has 0 seqs (no output)" >&2
    fi
done < tempdir2/paired_end_files.txt

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
clean_and_make_stats_Assemble_Demux
end=$(date +%s)
runtime=$((end-start))

#Make README.txt file for demultiplexed reads
printf "Files in 'assembled_out' directory represent assembled paired-end files.\n
If include only R1 = TRUE, then the unassembled R1 reads have been added to the set of assembled reads per sample.
This may be relevant when working with e.g. ITS2 sequences, because ITS2 region in some taxa is too long for assembly, 
therefore discarded completely after assembly process. Thus, including also unassembled R1 reads, partial ITS2 sequences 
for these taxa will be represented in the final output. 
If include only R1 option = TRUE, then other specified options (lenght, max error rate etc.) have not been 
applied to R1 reads in the 'assembled' file. Thus, additional quality filtering (if this was done before assembling) 
should be run on the 'assembled' data.\n
NOTE RUNNING THE PROCESS SEVERAL TIMES IN THE SAME DIRECTORY WILL OVERWRITE ALL THE OUTPUTS!

Core command -> 
vsearch --fastq_mergepairs inputR1 --reverse inputR2 $fastq_minoverlen $fastq_minmergelen $allowmergestagger $fastq_maxdiffs $fastq_maxns $fastq_maxmergelen $fastqout_notmerged_fwd $fastqout_notmerged_rev --fastq_qmax $fastq_qmax --fastq_qmaxout $fastq_qmax --fastqout output_file

\nSummary of sequence counts in 'seq_count_summary.txt'\n
\n\nTotal run time was $runtime sec.\n\n\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#vsearch v2.18.0 for assembling paired-end reads
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #https://github.com/torognes/vsearch
##########################################################" > $output_dir/README.txt

###Done, files in $output_dir folder
printf "\nDONE\n"
printf "Data in directory $output_dir\n"
printf "Summary of sequence counts in 'seq_count_summary.txt'\n"
printf "Check README.txt file in $output_dir for further information about the process.\n\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"