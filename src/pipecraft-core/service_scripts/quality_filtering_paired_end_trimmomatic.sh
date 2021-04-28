#!/bin/bash

#Input = paired-end fastq files.

# Quality filter PAIRED-END sequencing data with trimmomatic

##########################################################
###Third-party applications:
#trimmomatic
    #citation: Bolger, A. M., Lohse, M., & Usadel, B. (2014). Trimmomatic: A flexible trimmer for Illumina Sequence Data. Bioinformatics, btu1
    #Distributed under the GNU GENERAL PUBLIC LICENE
    #https://github.com/usadellab/Trimmomatic
#pigz
##########################################################

###############################
###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
extension=$"fq"
#mandatory options
window_size=$"5"
required_qual=$"27"
min_length=$"32"
#additional options
threads=$"4"
phred="33"
###############################
###############################

#additional options, if selection != undefined
if [ leading_qual_threshold == "undefined" ]; then
    :
else
    LEADING=$"LEADING:2"
fi
if [ trailing_qual_threshold == "undefined" ]; then
    :
else
    TRAILING=$"TRAINING:2"
fi
#############################
### Start of the workflow ###
#############################
start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"qualFiltered_out"
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

    ###############################
    ### Start quality filtering ###
    ###############################
    #make dir for discarded seqs
    mkdir -p $output_dir/discarded

    trimmomatic PE \
    $inputR1.$newextension $inputR2.$newextension \
    $output_dir/$inputR1.qualFilt.$newextension $output_dir/discarded/$inputR1.discarded.$newextension \
    $output_dir/$inputR2.qualFilt.$newextension $output_dir/discarded/$inputR2.discarded.$newextension \
    $LEADING \
    $TRAILING \
    -phred$phred \
    SLIDINGWINDOW:$window_size:$required_qual \
    MINLEN:$min_length \
    -threads $threads

    if [ "$?" = "0" ]; then
        :
    else
        printf '%s\n' "ERROR]: Unknown ERROR when quality filtering $inputR1.$newextension and $inputR2.$newextension.
Please check the files - not correct FASTQ formats? Paired-end file names not matching?
>Quitting" >&2
        end_process
    fi
done < tempdir2/paired_end_files.txt

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
#file identifier string after the process
outfile_addition=$"qualFilt"
clean_and_make_stats

#Make README.txt file for discarded seqs
printf "Files in /discarded folder represent sequences that did not pass quality filtering.\n
If no files in this folder, then all sequences were passed to files in $output_dir directory" > $output_dir/untrimmed/README.txt

#Make README.txt file for PrimerClipped reads
printf "Files in /$output_dir folder represent quality filtered sequences according to the selected options.\n
Output R1 and R2 reads are synchronized for merging paired-end data." > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"

end=$(date +%s)
runtime=$((end-start))
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=/$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=paired-end"
