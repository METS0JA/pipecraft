#!/bin/bash

#Input = single-end fasta/fastq files. FASTQ files will be converted to FASTA files; output is only FASTA.

# Chimera filtering

##########################################################
###Third-party applications:
#vsearch
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#pigz
#perl
##########################################################

###############################
###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
extension=$"fasta"
#mandatory options
id="--id 0.98"
minuniquesize="--minuniquesize 1"
#additional options
cores=$"--threads 4"
abskew=$"--abskew 2"
minh=$"--minh 0.28"

#reference_based=$"undefined"
denovo=$"undefined"
reference_based=$"/home/sten/Downloads/uchime_reference_dataset_28.06.2017/ITS1_ITS2_datasets/uchime_reference_dataset_ITS2_28.06.2017.fasta" #or 'undefined', if selection is not active

###############################
###############################

#############################
### Start of the workflow ###
#############################
#additional options, if selection != undefined
if [[ $reference_based == "undefined" ]]; then
    :
else
    database=$reference_based
fi
if [[ $denovo == "undefined" ]]; then
    :
else
    denovo_filt=$"TRUE"
fi

start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh
# map.pl script location
map=$"/scripts/map.pl"

#output dir
output_dir=$"chimera_Filtered_out"
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env
#make output dir for CHIMERAS
mkdir $output_dir/chimeras
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
        checkerror=$(seqkit fq2fa -t dna --line-width 0 $input.$newextension -o $input.qualFilt.fasta 2>&1)
        check_app_error
        printf "Note: converted $newextension to FASTA \n"

        newextension=$"fasta"
        export newextension
    fi

    ###############################
    ### Start chimera filtering ###
    ###############################
    #dereplicate sequences
    if [[ $denovo_filt == "TRUE" ]]; then
        checkerror=$(vsearch --derep_fulllength $input.$newextension \
        $minuniquesize \
        --sizeout \
        --fasta_width 0 \
        --uc tempdir/dereplicated.uc \
        --output tempdir/$input.derep.$newextension 2>&1)
        check_app_error

        #pre-cluster sequences; sorts seqs automaticcaly by decreasing abundance
        checkerror=$(vsearch --cluster_size tempdir/$input.derep.$newextension \
        $cores \
        $id \
        --strand both \
        --sizein \
        --sizeout \
        --fasta_width 0 \
        --uc tempdir/preclustered.uc \
        --centroids tempdir/$input.preclustered.$newextension 2>&1)
        check_app_error

        #search chimeras
        checkerror=$(vsearch --uchime_denovo tempdir/$input.preclustered.$newextension \
        $abskew \
        $minh \
        --sizein \
        --sizeout \
        --fasta_width 0 \
        --chimeras $output_dir/chimeras/$input.denovo.chimeras.$newextension \
        --nonchimeras tempdir/$input.denovo.nonchimeras.$newextension 2>&1)
        check_app_error

        if [[ $reference_based == "undefined" ]]; then
            #Extract all non-chimeric sequences and add to $output_dir
            perl $map tempdir/$input.derep.$newextension \
            tempdir/preclustered.uc \
            tempdir/$input.denovo.nonchimeras.$newextension \
            > tempdir/denovo.nonchimeras.fasta

            perl $map $input.$newextension \
            tempdir/dereplicated.uc \
            tempdir/denovo.nonchimeras.fasta \
            > $output_dir/$input.denovo.nonchimeras.$newextension
        else
            checkerror=$(vsearch --uchime_ref tempdir/$input.denovo.nonchimeras.$newextension \
            $cores \
            --db $database \
            --sizein \
            --sizeout \
            --fasta_width 0 \
            --chimeras $output_dir/chimeras/$input.ref.chimeras.$newextension \
            --nonchimeras tempdir/$input.ref.denovo.nonchimeras.$newextension 2>&1)
            check_app_error

            #Extract all non-chimeric sequences
            perl $map tempdir/$input.derep.$newextension \
            tempdir/preclustered.uc \
            tempdir/$input.ref.denovo.nonchimeras.$newextension \
            > tempdir/ref.denovo.nonchimeras.fasta

            perl $map $input.$newextension \
            tempdir/dereplicated.uc \
            tempdir/ref.denovo.nonchimeras.fasta \
            > $output_dir/$input.ref.denovo.nonchimeras.$newextension
        fi
    
    else #only reference based chimera filtering
        checkerror=$(vsearch --uchime_ref $input.$newextension \
        $cores \
        --db $database \
        --sizein \
        --sizeout \
        --fasta_width 0 \
        --chimeras $output_dir/chimeras/$input.ref.chimeras.$newextension \
        --nonchimeras $output_dir/$input.ref.nonchimeras.$newextension 2>&1)
        check_app_error
    fi
done

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
#file identifier string after the process
if [[ $reference_based == "undefined" ]]; then
    outfile_addition=$"denovo.nonchimeras"
elif [[ $denovo == "undefined" ]]; then
    outfile_addition=$"ref.nonchimeras"
else
    outfile_addition=$"ref.denovo.nonchimeras"
fi

clean_and_make_stats

#Make README.txt file
printf "Files in /$output_dir directory represent chimera filtered sequences.
Files in $output_dir/chimeras directory represent identified putative chimeric sequences.
In input was FASTQ formatted file(s), then it was converted to FASTA, and only FASTA is outputted.
\n" > $output_dir/README.txt

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
echo "readType=single-end"
