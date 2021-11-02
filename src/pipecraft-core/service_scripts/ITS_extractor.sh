#!/bin/bash

#Input = single-end fasta/fastq files. FASTQ files will be converted to FASTA files; output is only FASTA.

# Extraction of ITS region(s)

##########################################################
###Third-party applications:
#ITSx v1.1.3
    #citation: Bengtsson-Palme J., et al., 2013. Improved software detection and extraction of ITS1 and ITS2 from ribosomal ITS sequences of fungi and other eukaryotes for analysis of environmental sequencing data. Methods in Ecology and Evolution 4, 914-919.
    #Copyright (C) 2012-2021 Johan Bengtsson-Palme et al.
    #Distributed under the GNU General Public License
    #microbiology.se/software/itsx/
#seqkit v2.0.0
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
#pigz v2.4
#perl v5.32.0
##########################################################

###############################
###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
echo $Regions
echo $Organisms
extension=$fileFormat
#mandatory options
organisms=$"-t all"             # list: A,B,C,D,E,F,G,H,I,L,M,O,P,Q,R,S,T,U,X,Y
# organisms=$"-t ${Organisms}"             # list: A,B,C,D,E,F,G,H,I,L,M,O,P,Q,R,S,T,U,X,Y
regions=$"--save_regions ${Regions}"   # list: all,SSU,ITS1,5.8S,ITS2,LSU
echo $regions
echo $organisms
partial=$"--partial ${partial}"
#additional options
cores=$"--cpu ${cores}"                # pos int
eval=$"-E 1e4"                  # float (E)
score=$"-S ${scores}"                   # pos int
domains=$"-N ${domains}"                 # pos int
complement=$complement         # or TRUE
only_full=$only_full          # or TRUE
truncate=$truncate           # or TRUE
###############################
###############################

#############################
### Start of the workflow ###
#############################
#additional options, if selection != undefined
if [[ $complement == false ]]; then
    :
else
    complement_in=$"--complement"
fi
if [[ $only_full == false ]]; then
    :
else
    only_full_in=$"--only_full"
fi
if [[ $truncate == false ]]; then
    :
else
    truncate_in=$"--truncate"
fi

start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/ITSx_out"
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env
#make output dir for no-detections
mkdir $output_dir/no_detections
### Process samples
for file in *.$extension; do
    ### Make temporary directory for temp files (for each sample)
    if [ -d tempdir ]; then
        rm -rf tempdir
    fi
    mkdir tempdir
    #Read file name; without extension
    input=$(echo $file | sed -e "s/.$extension//")
    ## Preparing files for the process
    printf "\n____________________________________\n"
    printf "Processing $input ...\n"
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_SE
    ### Check input formats (fastq supported)
    check_extension_fastx

    #If input is FASTQ then convert to FASTA
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
        checkerror=$(seqkit fq2fa -t dna --line-width 0 $input.$newextension -o $input.fasta 2>&1)
        check_app_error
        printf "Note: converted $newextension to FASTA \n"

        newextension=$"fasta"
        export newextension
        was_fastq=$"TRUE"
    fi

    ##################
    ### Start ITSx ###
    ##################
    #dereplicate sequences
    checkerror=$(mothur "#unique.seqs(fasta=$input.$newextension)" 2>&1)
    check_app_error
    mv $input.unique.$newextension tempdir
    mv $input.names tempdir

    #Run ITSx
    checkerror=$(ITSx -i tempdir/$input.unique.$newextension \
    -o tempdir/$input. \
    --preserve T \
    --graphical F \
    $organisms \
    $partial \
    $regions \
    $cores \
    $eval \
    $score \
    $domains \
    $complement_in \
    $only_full_in \
    $truncate_in 2>&1)
    check_app_error

    #Delete empty output files
    find tempdir -empty -type f -delete

    #map dereplicated sequences back to generate full output file
    if [[ -s tempdir/$input..SSU.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..SSU.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..SSU.redundant.fasta $output_dir
        mv $output_dir/$input..SSU.redundant.fasta $output_dir/$input.SSU.fasta
        mkdir -p $output_dir/SSU
        mv $output_dir/$input.SSU.fasta $output_dir/SSU
    fi
    if [[ -s tempdir/$input..ITS1.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..ITS1.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..ITS1.redundant.fasta $output_dir
        mv $output_dir/$input..ITS1.redundant.fasta $output_dir/$input.ITS1.fasta
        mkdir -p $output_dir/ITS1
        mv $output_dir/$input.ITS1.fasta $output_dir/ITS1
    fi
    if [[ -s tempdir/$input..5_8S.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..5_8S.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..5_8S.redundant.fasta $output_dir
        mv $output_dir/$input..5_8S.redundant.fasta $output_dir/$input.5_8S.fasta
        mkdir -p $output_dir/5_8S
        mv $output_dir/$input.5_8S.fasta $output_dir/5_8S
    fi
    if [[ -s tempdir/$input..ITS2.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..ITS2.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..ITS2.redundant.fasta $output_dir
        mv $output_dir/$input..ITS2.redundant.fasta $output_dir/$input.ITS2.fasta
        mkdir -p $output_dir/ITS2
        mv $output_dir/$input.ITS2.fasta $output_dir/ITS2
    fi
    if [[ -s tempdir/$input..LSU.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..LSU.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..LSU.redundant.fasta $output_dir
        mv $output_dir/$input..LSU.redundant.fasta $output_dir/$input.LSU.fasta
        mkdir -p $output_dir/LSU
        mv $output_dir/$input.LSU.fasta $output_dir/LSU
    fi
    if [[ -s tempdir/$input..full.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input..full.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input..full.redundant.fasta $output_dir
        mv $output_dir/$input..full.redundant.fasta $output_dir/$input.full.fasta
        mkdir -p $output_dir/full_ITS
        mv $output_dir/$input.full.fasta $output_dir/full_ITS
    fi
    if [[ -s tempdir/$input._no_detections.fasta ]]; then
        checkerror=$(mothur "#deunique.seqs(fasta=tempdir/$input._no_detections.fasta, name=tempdir/$input.names)" 2>&1)
        check_app_error
        mv tempdir/$input._no_detections.redundant.fasta $output_dir
        mv $output_dir/$input._no_detections.redundant.fasta $output_dir/no_detections/$input.no_detections.fasta
    fi
done

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"


#for each output separately (SSU,ITS1,5_8S,ITS2,LSU,full)
    #file identifier string after the process
if [[ -d $output_dir/SSU ]]; then
    outfile_addition=$"SSU"
    subdir=$"SSU"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/ITS1 ]]; then
    outfile_addition=$"ITS1"
    subdir=$"ITS1"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/5_8S ]]; then
    outfile_addition=$"5_8S"
    subdir=$"5_8S"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/ITS2 ]]; then
    outfile_addition=$"ITS2"
    subdir=$"ITS2"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/LSU ]]; then
    outfile_addition=$"LSU"
    subdir=$"LSU"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/full_ITS ]]; then
    outfile_addition=$"full"
    subdir=$"full_ITS"
    clean_and_make_stats_multidir
fi
if [[ -d $output_dir/no_detections ]]; then
    outfile_addition=$"no_detections"
    subdir=$"no_detections"
    clean_and_make_stats_multidir
fi

#If initial input was FASTQ then remove converted FASTA files
if [[ $was_fastq == "TRUE" ]]; then
    mkdir -p $output_dir/input_FASTA_files
    mv *.fasta $output_dir/input_FASTA_files
fi

#Make README.txt file
printf "Files in /$output_dir directory represent sequences that passed ITS Extractor.
Regions are placed under corrseponding directory (i.e., ITS2 sequences are in 'ITS2' directory).
Files in $output_dir/no_detections directory represent sequences where no ITS regions were identified.\n
If input was FASTQ formatted file(s), then it was converted to FASTA, and only FASTA is outputted.
Input FASTA files (converted from FASTQ) are in $output_dir/input_FASTA_files directory.
\n" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Summary of sequence counts in 'seq_count_summary.txt'\n"
printf "Check README.txt files in output directory for further information about the process.\n"

end=$(date +%s)
runtime=$((end-start))
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir/ITS1"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single-end"
