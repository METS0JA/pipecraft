#!/bin/bash

#DADA2 RDP naive Bayesian classifier (function assignTaxonomy)
#Input = fasta file in the working directory and specified database file

##########################################################
###Third-party applications:
#dada2 v1.20
    #citation: Callahan, B., McMurdie, P., Rosen, M. et al. (2016) DADA2: High-resolution sample inference from Illumina amplicon data. Nat Methods 13, 581–583. https://doi.org/10.1038/nmeth.3869
    #Distributed under the GNU LESSER GENERAL PUBLIC LICENSE
    #https://github.com/benjjneb/dada2
##################################################################

#env variables
workingDir=${workingDir}
extension=$fileFormat
#load variables
minBoot=${minBoot}
tryRC=${tryRC}
dada2_database=${dada2_database}

#Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/taxonomy_out.dada2"

#start time
start=$(date +%s)

### Check if files with specified extension exist in the dir
first_file_check
### Check if single-end files are compressed (decompress and check)
check_gz_zip_SE

### Get input rep seqs (OTUs.fasta) and give ERROR when multiple rep seqs files are in the working folder
i=$"0"
for file in *.$newextension; do
    input_fasta=$(echo $file)
    i=$((i + 1))
done
if [[ $i > 1 ]]; then
    printf '%s\n' "ERROR]: more than one representative sequence file ($newextension file) in the working folder" >&2
    end_process
else
    printf "\n input fasta = $input_fasta \n"
fi

#############################
### Start of the workflow ###
#############################
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env

###Run DADA2 classifier in R
printf "# Running DADA2 classifier \n"
errormessage=$(Rscript /scripts/submodules/dada2-classifier_independent.R 2>&1)
echo $errormessage > $output_dir/R_run.log 
wait
printf "\n DADA2 classifier completed \n"

########################################
### CLEAN UP AND COMPILE README FILE ###
########################################
if [[ -f $output_dir/R_run.log ]]; then
    rm -f $output_dir/R_run.log
fi
#Delete tempdir
if [[ -d tempdir2 ]]; then
    rm -rf tempdir2
fi

end=$(date +%s)
runtime=$((end-start))

###Make README.txt file
printf "Taxonomy annotation with DADA2 classifier (function assignTaxonomy).
# taxonomy.csv = classifier results with bootstrap values.

Core command -> 
tax = assignTaxonomy($input_fasta, $dada2_database, multithread = FALSE, minBoot = $minBoot, tryRC = $tryRC, outputBootstraps = TRUE)

Total run time was $runtime sec.

##########################################################
###Third-party applications [PLEASE CITE]:
#dada2 v1.20
    #citation: Callahan, B., McMurdie, P., Rosen, M. et al. (2016) DADA2: High-resolution sample inference from Illumina amplicon data. Nat Methods 13, 581–583. https://doi.org/10.1038/nmeth.3869
##################################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
