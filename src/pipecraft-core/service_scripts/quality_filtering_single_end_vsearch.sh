#!/bin/bash

# Quality filter SINGLE-END sequencing data with vsearch
# Input = single-end fastq files

##########################################################
###Third-party applications:
#vsearch v2.18.0
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#seqkit v2.0.0
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
#pigz v2.4
##########################################################

#load variables
extension=$fileFormat
maxee=$"--fastq_maxee ${maxee}"
maxns=$"--fastq_maxns ${maxNs}"
minlen=$"--fastq_minlen ${min_length}"
cores=$"--threads ${cores}"
qmax=$"--fastq_qmax ${qmax}"
qmin=$"--fastq_qmin ${qmin}"
trunclen=$trunc_length
maxlen=$max_length
maxeerate=$maxee_rate

#Source for functions
source /scripts/submodules/framework.functions.sh
#output dir
output_dir=$"/input/qualFiltered_out"

#additional options, if selection != undefined
if [[ $maxlen == null ]]; then
    max_length=$""
else
    max_length=$"--fastq_maxlen $maxlen"
fi
if [[ $maxeerate == null ]]; then
    maxee_rate=$""
else
    maxee_rate=$"--fastq_maxee_rate $maxeerate"
fi
if [[ $trunclen == null ]]; then
    trunc_length=$""
else
    trunc_length=$"--fastq_trunclen $trunc_length"
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
    mkdir -p $output_dir/FASTA

    checkerror=$(vsearch --fastq_filter \
    $input.$newextension \
    $maxee \
    $maxns \
    $trunc_length \
    $minlen \
    $cores \
    $qmax \
    $qmin \
    $max_length \
    $maxee_rate \
    --fastqout $output_dir/$input.$newextension \
    --fastaout $output_dir/FASTA/$input.fasta 2>&1)
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
printf "Files in 'qualFiltered_out' directory represent quality filtered sequences in FASTQ format according to the selected options.
Files in 'qualFiltered_out/FASTA' directory represent quality filtered sequences in FASTA format.
If the quality of the data is sufficent after this step (check with QualityCheck module), then
you may proceed with FASTA files only.\n

Core command -> 
vsearch --fastq_filter input_file $maxee $maxns $trunc_length $minlen $cores $qmax $qmin $max_length $maxee_rate --fastqout $output_dir/output_file.fastq --fastaout $output_dir/FASTA/output_file.fasta

\nSummary of sequence counts in 'seq_count_summary.txt'\n
\n\nTotal run time was $runtime sec.\n\n\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#vsearch v2.18.0 for quality filtering
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
##########################################################" > $output_dir/README.txt

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
