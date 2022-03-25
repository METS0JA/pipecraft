#!/bin/bash

# De novo chimera filtering using VSEARCH
# Input = single-end fasta/fastq files. FASTQ files will be converted to FASTA files; output is only FASTA.

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
export extension=$fileFormat
export id=$"--id ${pre_cluster}" #float (0-1)
export minuniquesize=$"--minuniquesize ${min_unique_size}" #pos int >0

export cores=$"--threads ${cores}" #pos int = number of cores for 
processes=$nproc            #pos int = number of chimera filtering processes to run in parallel

export abskew=$"--abskew ${abundance_skew}" #pos int
export minh=$"--minh ${min_h}"              #float (0-1)
export inclborderline=${inclborderline}     #bool (FALSE or TRUE)


#Source for functions
source /scripts/framework.functions.sh
# export -f check_app_error

#output dir
export output_dir=$"/input/chimera_Filtered_out"


ls -l
pwd
ls -la /extraFiles

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check single-end data
prepare_SE_env

## Make output dir for CHIMERAS
mkdir -p $output_dir/chimeras
mkdir -p $output_dir/chimeras/logs

## Make temporary directory for temp files
if [ -d tempdir ]; then
    rm -rf tempdir
fi 
mkdir tempdir



## If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
      #$extension will be $newextension
check_gz_zip_SE

## Check input formats (fastq/fasta supported)
check_extension_fastx


## Function to perform chimera filtering
chimera_filtering (){
  # $1 = input file name
  # $2 = output file prefix

  ## Preparing files for the process
  printf "Processing "$1" ...\n" >> "$2".log

  ## Dereplicate sequences
  printf "Dereplicating ...\n" >> "$2".log
  vsearch \
    --derep_fulllength "$1" \
    $minuniquesize \
    --sizein --sizeout \
    --fasta_width 0 \
    --uc tempdir/"$2".dereplicated.uc \
    --output tempdir/"$2".derep.fasta \
    2>> "$2".log

  ## Pre-cluster sequences; sorts seqs automaticcaly by decreasing abundance
  printf "Pre-clustering ...\n" >> "$2".log
  vsearch \
    --cluster_size tempdir/"$2".derep.fasta \
    $cores \
    $id \
    --strand both \
    --sizein --sizeout \
    --fasta_width 0 \
    --uc tempdir/"$2".preclustered.uc \
    --centroids tempdir/"$2".preclustered.fasta \
    2>> "$2".log

  ## Search chimeras
  printf "Chimera removal ...\n" >> "$2".log
  vsearch \
    --uchime_denovo tempdir/"$2".preclustered.fasta \
    $abskew \
    $minh \
    --sizein \
    --sizeout \
    --fasta_width 0 \
    --chimeras $output_dir/chimeras/"$2".denovo.chimeras.fasta \
    --nonchimeras tempdir/"$2".nonchim.fasta \
    --borderline tempdir/"$2".borderline.fasta \
    2>> "$2".log

  ## Merge non-chimeras with borderline sequences
  if [[ $inclborderline == "true" ]]; then
    printf "Recovering borderline sequences ...\n" >> "$2".log
    cat \
      tempdir/"$2".nonchim.fasta \
      tempdir/"$2".borderline.fasta \
      > $output_dir/"$2".fasta
  else
    mv $output_dir/"$2".nonchim.fasta tempdir/"$2".fasta
  fi

  printf "Processing "$1" finished.\n" >> "$2".log
}



## Export the function
export -f chimera_filtering

## Process all input files
parallel -j $processes \
  "chimera_filtering {} {.}" \
  ::: *.fasta





#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
if [[ $was_fastq == "TRUE" ]]; then
    #Delete tempdirs
    if [ -d tempdir ]; then
        rm -rf tempdir
    fi
    if [ -d tempdir2 ]; then
        rm -rf tempdir2
    fi
    #make stats
    cd $output_dir/FASTA
    mkdir -p tempdir2
    clean_and_make_stats
    cd ..
else
    clean_and_make_stats
fi
end=$(date +%s)
runtime=$((end-start))

#Make README.txt file
printf "Files in 'chimeraFiltered_out' directory represent chimera filtered sequences.
Files in 'chimeraFiltered_out/chimeras' directory represent identified putative chimeric sequences.
In input was FASTQ formatted file(s), then it was converted to FASTA (chimeraFiltered_out/FASTA), and only FASTA is outputted.
\nSummary of sequence counts in 'seq_count_summary.txt'\n
\n\nTotal run time was $runtime sec.\n\n\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#vsearch v2.18.0 for chimera filtering
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#seqkit v2.0.0 for converting fastq to fasta (if input was fastq)
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
##########################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in '$output_dir/seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=/$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
