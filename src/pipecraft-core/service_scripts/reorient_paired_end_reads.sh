#!/bin/bash

#Input = paired-end fastq files.

#Reorient PAIRED-END reads: 
#mismatches = allowed number of differences for primer.
#Degenerate primers are allowed using IUPAC codes.
#Note that : symbols in the sequence headers will be changed to _

##########################################################
###Third-party applications:
#mothur
    #citation: Schloss PD et al. (2009) Introducing mothur: Open-Source, Platform-Independent, Community-Supported Software for Describing and Comparing Microbial Communities Appl Environ Microbiol 75:7537-7541
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation"
    #https://github.com/mothur/mothur
#seqkit
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
#fqgrep
    #Copyright (c) 2011-2016, Indraniel Das
    #https://github.com/indraniel/fqgrep
#vsearch
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#pigz
##########################################################

###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
extension=$fileFormat
fwd_tempprimer=$forward_primers
#fwd_tempprimer=$"ACCTGCTAGGCTAGATGC,TAGCTGATCGATCGATCG"
#rev_tempprimer=$"GGGATCCATCGATTTAAC"
rev_tempprimer=$reverse_primers

echo $mismatches
echo $extension
echo $fwd_tempprimer
echo $rev_tempprimer
###############################
###############################

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"reoriented_out"
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_PE_env

### Process samples
while read LINE; do
    ### Make temporary directory for temp files (for each sample)
    if [ -d tempdir ]; then
        rm -rf tempdir
    fi 
    mkdir tempdir
    #Write file name without extension
    inputR1=$(echo $LINE | sed -e "s/.$extension//")
    inputR2=$(echo $inputR1 | sed -e 's/R1/R2/')
    ## Preparing files for reorienting
    printf "\n____________________________________\n"
    printf "Preparing $inputR1 and $inputR2 for reorienting ...\n"

    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_PE
    ### Check input formats (only fastq/fq supported)
    check_extension_fastq

    #########################
    ### Start reorienting ###
    #########################
    printf "\n# Reorienting paired-end reads based on PCR primers: \n"
      
    # Reorient functions, running in parallel for fwd and rev primers
    PE_reorient_FWD &
    PE_reorient_REV &
    wait
    #if rev primer found in R1, then make reverse complementary and merge with 5_3.fastq file
    if [ -s tempdir/R1.3_5.fastq ]; then
        seqkit seq --quiet -t dna -r -p tempdir/R1.3_5.fastq >> tempdir/R1.5_3.fastq
    fi
    #if fwd primer found in R2, then make reverse complementary and merge with 3_5.fastq file
    if [ -s tempdir/R2.5_3.fastq ]; then
        seqkit seq --quiet -t dna -r -p tempdir/R2.5_3.fastq >> tempdir/R2.3_5.fastq
    fi

    #Check if seqs contained the specified primer strings
    if [ -s tempdir/R1.5_3.fastq ]; then
        :
    else
        printf '%s\n' "[WARNING]: specified primers not found in $inputR1.$newextension (SKIPPING file; also $inputR2.$newextension)" \
        && rm -rf tempdir && continue
    fi
    if [ -s tempdir/R2.3_5.fastq ]; then
        :
   else
        printf '%s\n' "[WARNING]: specified primers not found in $inputR2.$newextension (SKIPPING file; also $inputR1.$newextension)" \
        && rm -rf tempdir && continue
    fi

    ### Remove multiprimer artefacts
    # R1 multi-primer artefacts search in parallel with search in R2 reads.
    multiprimer_search_R1 &
    multiprimer_search_R2 &
    wait

    ### Move multiprimer chimeras to '$output_dir/multiprimer_chimeras' dir
    mkdir -p $output_dir/multiprimer_chimeras
    if [ -s tempdir/$inputR1.multiprimer.$newextension ]; then
        mv tempdir/$inputR1.multiprimer.$newextension $output_dir/multiprimer_chimeras
    fi
    if [ -s tempdir/$inputR2.multiprimer.$newextension ]; then
        mv tempdir/$inputR2.multiprimer.$newextension $output_dir/multiprimer_chimeras
    fi
        
    #pair R1 and R2 seqs (synchronize)
    printf "\nSynchronizing R1 and R2 reads (matching order for paired-end reads merging)\n"
    cd tempdir && \
    seqkit pair -1 $inputR1.reoriented.$newextension -2 $inputR2.reoriented.$newextension --quiet
    rm $inputR1.reoriented.$newextension
    rm $inputR2.reoriented.$newextension
    mv $inputR1.reoriented.paired.$newextension $inputR1.reoriented.$newextension
    mv $inputR2.reoriented.paired.$newextension $inputR2.reoriented.$newextension
    cd ..
    #Move final files to $output_dir
    mv tempdir/$inputR1.reoriented.$newextension $output_dir/$inputR1.reoriented.$newextension
    mv tempdir/$inputR2.reoriented.$newextension $output_dir/$inputR2.reoriented.$newextension

    ### Check if reoriented output is empty; if yes, then report WARNING
    if [ -s $output_dir/$inputR1.reoriented.$newextension ]; then
        size=$(echo $(cat $output_dir/$inputR1.reoriented.$newextension | wc -l) / 4 | bc)
        printf "$size sequences in $inputR1.reoriented.$newextension\n"
    else
        printf '%s\n' "[WARNING]: after synchronizing, $inputR1 has 0 seqs (no output)"
        rm $output_dir/$inputR1.reoriented.$newextension
    fi
    if [ -s $output_dir/$inputR2.reoriented.$newextension ]; then
        size=$(echo $(cat $output_dir/$inputR2.reoriented.$newextension | wc -l) / 4 | bc)
        printf "$size sequences in $inputR2.reoriented.$newextension\n"
    else
        printf '%s\n' "[WARNING]: after synchronizing, $inputR2 has 0 seqs (no output)"
        rm $output_dir/$inputR2.reoriented.$newextension
    fi
done < tempdir2/paired_end_files.txt

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
#file identifier string after the process
outfile_addition=$"reoriented"
clean_and_make_stats

#Make README.txt file for multi-primer chimeras
printf "If there are some files in that directory here,
then the sequences in these files were considered as chimeric ones and removed from the reoriented data set.\n\n
Logic behind considering these seqs as chimeric ones:
PCR primer strings were specified in orientation they are used in a PCR; i.e.
forward primer in 5'-3' orientation and reverse primer in 3'-5' orientation.
[IF THAT WAS NOT THE CASE, THEN RUN THIS STEP AGAIN!]
Therefore if a forward primer string was found in a sequence,
but also a reverse primer sting was found in the same sequence,
the sequence consists of 5'-3' and 3'-5' oriented fragments.
It is highly likely that this sequence is a chimeric one, and should be therefore removed.
Usually only very few such 'multi-primer' chimeric sequences are found in the amplicon data sets.\n" > $output_dir/multiprimer_chimeras/README.txt

#Make README.txt file for this process
printf "*.$outfile_addition.fastq files here represent sequences that have been reoriented based on PCR primers.
Forward primer(s) [has to be 5'-3']: $fwd_tempprimer
Reverse primer(s) [has to be 3'-5']: $rev_tempprimer
[If primers were not specified in orientations noted above, please run this step again].\n
Output R1 and R2 reads have been synchronized for merging paired-end data. 
(R1 reads are 5'-3' oriented and R2 reads 3'-5' oriented (for merging paired-end data)).\n
Note that, when applicable, then ':' symbols in the sequence headers (before space or tab) are changed to '_'.
This does not affect merging paired-end reads using PipeCraft implemented software.\n
RUNNING THE PROCESS SEVERAL TIMES IN THE SAME DIRECTORY WILL OVERWRITE ALL THE OUTPUTS!" > $output_dir/README.txt

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
echo "dataFormat=demultiplexed"
echo "readType=paired-end"
