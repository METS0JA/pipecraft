#!/bin/bash

# Quality filter PAIRED-END sequencing data with dada2
# Input = paired-end fastq files

##########################################################
###Third-party applications:
#dada2 v1.20
    #citation: Callahan, B., McMurdie, P., Rosen, M. et al. (2016) DADA2: High-resolution sample inference from Illumina amplicon data. Nat Methods 13, 581–583. https://doi.org/10.1038/nmeth.3869
    #Copyright (C) 2007 Free Software Foundation, Inc.
    #Distributed under the GNU LESSER GENERAL PUBLIC LICENSE
    #https://github.com/benjjneb/dada2
##########################################################

#load env variables
readType=${readType}
extension=${fileFormat}
dataFormat=${dataFormat}
workingDir=${workingDir}

#load variables
read_R1=${read_R1}
read_R2=${read_R2}
samp_ID=${samp_ID}
maxEE=${maxEE}
maxN=${maxN}
truncQ=${truncQ}
truncLen_R1=${truncLen}
truncLen_R2=${truncLen_R2}
minLen=${minLen}
maxLen=${maxLen}
minQ=${minQ}

#Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/qualFiltered_out"

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_PE_env

#Check R1 identifiers
while read file; do
    if [[ $file == *"$read_R1"* ]]; then
        :
    else
        printf '%s\n' "ERROR]: 'read R1/R2' identifiers are incorrectly specified.
        Check also 'samp ID' setting.
        >Quitting" >&2
        end_process
    fi
done < tempdir2/paired_end_files.txt

### Process samples with dada2 filterAndTrim function in R
printf "# Running DADA2 filterAndTrim \n"
errormessage=$(Rscript /scripts/submodules/dada2-quality.R 2>&1)
echo $errormessage > $output_dir/R_run.log 
wait
printf "\n DADA2 filterAndTrim completed \n"

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
end=$(date +%s)
runtime=$((end-start))

#Make README.txt file
printf "# Quality filtering of PAIRED-END sequencing data with dada2.
Files in 'qualFiltered_out' directory represent quality filtered sequences in FASTQ format according to the selected options.

Core command -> 
filterAndTrim(inputR1, outputR1, inputR2, outputR2, maxN = $maxN, maxEE = c($maxEE, $maxEE), truncQ = $truncQ, truncLen= c($truncLen_R1, $truncLen_R2), maxLen = $maxLen, minLen = $minLen, minQ=$minQ, rm.phix = TRUE, compress = FALSE, multithread = TRUE)

Summary of sequence counts in 'seq_count_summary.txt'

Total run time was $runtime sec.
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#dada2 v1.20
    #citation: Callahan, B., McMurdie, P., Rosen, M. et al. (2016) DADA2: High-resolution sample inference from Illumina amplicon data. Nat Methods 13, 581–583. https://doi.org/10.1038/nmeth.3869
    #https://github.com/benjjneb/dada2
########################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$fileFormat"
echo "dataFormat=$dataFormat"
echo "readType=paired_end"

