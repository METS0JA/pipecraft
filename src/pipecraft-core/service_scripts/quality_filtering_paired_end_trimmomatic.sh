#!/bin/bash

#Input = paired-end fastq files.

# Quality filter PAIRED-END sequencing data with trimmomatic

##########################################################
###Third-party applications:
#trimmomatic v0.39
    #citation: Bolger, A. M., Lohse, M., & Usadel, B. (2014). Trimmomatic: A flexible trimmer for Illumina Sequence Data. Bioinformatics, btu1
    #Distributed under the GNU GENERAL PUBLIC LICENE
    #https://github.com/usadellab/Trimmomatic
#seqkit v2.0.0
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
#pigz v2.4
##########################################################

###############################
###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
extension=$fileFormat
#mandatory options
window_size=$window_size
required_qual=$required_quality
min_length=$min_length
#additional options
threads=$cores
phred=$phred
leading_qual_threshold=$leading_qual_threshold #or 'undefined', if selection is not active
trailing_qual_threshold=$trailing_qual_threshold #or 'undefined', if selection is not active
###############################
###############################

#############################
### Start of the workflow ###
#############################
#additional options, if selection != undefined
if [[ $leading_qual_threshold == null ]]; then
    :
else
    LEADING=$"LEADING:$leading_qual_threshold"
fi
if [[ $trailing_qual_threshold == null ]]; then
    :
else
    TRAILING=$"TRAILING:$trailing_qual_threshold"
fi

start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh

#output dir
output_dir=$"/input/qualFiltered_out"
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
    printf "Processing $inputR1 and $inputR2 ...\n"
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_PE
    ### Check input formats (fastq supported)
    check_extension_fastq

    ###############################
    ### Start quality filtering ###
    ###############################
    #make dir for discarded seqs
    mkdir -p $output_dir/discarded

    checkerror=$(java -jar /Trimmomatic-0.39/trimmomatic-0.39.jar PE \
    $inputR1.$newextension $inputR2.$newextension \
    $output_dir/$inputR1.$newextension $output_dir/discarded/$inputR1.discarded.$newextension \
    $output_dir/$inputR2.$newextension $output_dir/discarded/$inputR2.discarded.$newextension \
    $LEADING \
    $TRAILING \
    -phred$phred \
    SLIDINGWINDOW:$window_size:$required_qual \
    MINLEN:$min_length \
    -threads $threads 2>&1)
    check_app_error

    #Convert output fastq files to FASTA
    mkdir -p $output_dir/FASTA
    checkerror=$(seqkit fq2fa -t dna --line-width 0 $output_dir/$inputR1.$newextension -o $output_dir/FASTA/$inputR1.fasta 2>&1)
    check_app_error
    checkerror=$(seqkit fq2fa -t dna --line-width 0 $output_dir/$inputR2.$newextension -o $output_dir/FASTA/$inputR2.fasta 2>&1)
    check_app_error
done < tempdir2/paired_end_files.txt

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
#file identifier string after the process
clean_and_make_stats

#Make README.txt file for discarded seqs
printf "Files in /discarded folder represent sequences that did not pass quality filtering.\n
If no files in this folder, then all sequences were passed to files in $output_dir directory" > $output_dir/untrimmed/README.txt

#Make README.txt file
printf "Files in this directory represent quality filtered sequences in FASTQ format according to the selected options.
Files in /FASTA directory represent quality filtered sequences in FASTA format.
If the quality of the data is sufficent after this step (check with QualityCheck module), then
you may proceed with FASTA files only (however, note that FASTQ files are needed to assemble paired-end data).\n" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"

end=$(date +%s)
runtime=$((end-start))
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=paired-end"
