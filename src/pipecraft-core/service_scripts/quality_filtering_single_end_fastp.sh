#!/bin/bash

# Quality filter SINGLE-END sequencing data with fastp
# Input = single-end fastq files

##########################################################
###Third-party applications:
#fastp v0.23.2
    #citation: Shifu Chen, Yanqing Zhou, Yaru Chen, Jia Gu; fastp: an ultra-fast all-in-one FASTQ preprocessor, Bioinformatics, Volume 34, Issue 17, 1 September 2018, Pages i884–i890, https://doi.org/10.1093/bioinformatics/bty560
    #Copyright (c) 2016 OpenGene - Open Source Genetics Toolbox
    #Distributed under the MIT License
    #https://github.com/OpenGene/fastp
#pigz v2.4
##########################################################

#load variables
extension=$fileFormat
window_size=$"--cut_window_size ${window_size}"
required_qual=$"--cut_mean_quality ${required_qual}"
min_qual=$"--qualified_quality_phred ${min_qual}"
min_qual_thresh=$"--unqualified_percent_limit ${min_qual_thresh}"
maxNs=$"--n_base_limit ${maxNs}"
min_length=$"--length_required ${min_length}"
max_length=$"--length_limit ${max_length}"
trunc_length=$"--max_len1 ${trunc_length}"
aver_qual=$"--average_qual ${aver_qual}"
cores=$"--thread ${cores}"

#Source for functions
source /scripts/submodules/framework.functions.sh
#output dir
output_dir=$"/input/qualFiltered_out"

#additional options, if selection != undefined
low_complex_filt=$low_complexity_filter
if [[ $low_complex_filt == null ]]; then
    low_complexity_filter=$""
else
    low_complexity_filter=$"--low_complexity_filter --complexity_threshold $low_complex_filt"
fi

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env
### Process samples
for file in *.$extension; do
    #Read file name; without extension
    input=$(echo $file | sed -e "s/.$extension//")
    ## Preparing files for the process
    printf "\n____________________________________\n"
    printf "Processing $input ...\n"
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_SE
    ### Check input formats (fastq supported)
    check_extension_fastq

    ###############################
    ### Start quality filtering ###
    ###############################
    checkerror=$(fastp --in1 $input.$newextension \
                       --out1 $output_dir/$input.$newextension \
                       $window_size \
                       $required_qual \
                       $min_qual \
                       $min_qual_thresh \
                       $maxNs \
                       $min_length \
                       $max_length \
                       $trunc_length \
                       $aver_qual \
                       $cores \
                       --html $output_dir/fastp_report/$input.html \
                       --disable_adapter_trimming \
                       $low_complexity_filter 2>&1)
                       check_app_error
done

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
clean_and_make_stats
end=$(date +%s)
runtime=$((end-start))

#Make README.txt file
printf "Files in 'qualFiltered_out' directory represent quality filtered sequences in FASTQ format according to the selected options.\n

Core command -> 
fastp --in1 input --out1 output $window_size $required_qual $min_qual $min_qual_thresh $maxNs $min_length $max_length $trunc_length $aver_qual $cores --html fastp_report/sample_name.html --disable_adapter_trimming $low_complexity_filter

\nSummary of sequence counts in 'seq_count_summary.txt'\n

\nTotal run time was $runtime sec.\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#fastp v0.23.2
    #citation: Shifu Chen, Yanqing Zhou, Yaru Chen, Jia Gu; fastp: an ultra-fast all-in-one FASTQ preprocessor, Bioinformatics, Volume 34, Issue 17, 1 September 2018, Pages i884–i890, https://doi.org/10.1093/bioinformatics/bty560
    #https://github.com/OpenGene/fastp
########################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
