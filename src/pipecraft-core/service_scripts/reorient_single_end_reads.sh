#!/bin/bash

#Input = fastq or fasta files.

#Reorient SINGLE-END reads: 
#mismatches = allowed number of differences for primer.
#Degenerate primers are allowed using IUPAC codes.
#Note that : symbols in the sequence headers will be changed to _

##########################################################
###Third-party applications:
#mothur
    #citation: Schloss PD et al. (2009) Introducing mothur: Open-Source, Platform-Independent, Community-Supported Software for Describing and Comparing Microbial Communities Appl Environ Microbiol 75:7537-7541
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation"
    #https://github.com/mothur/mothur
#FASTX-Toolkit (fastx_reverse_complement command)
    #Distributed under the GNU Affero General Public License version 3 or later
    #http://hannonlab.cshl.edu/fastx_toolkit/commandline.html
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
extension=$"fastq"
mismatches=$"2"
fwd_tempprimer=$"ACCTGCTAGGCTAGATGC"
rev_tempprimer=$"GGGATCCATCGATTTAAC"
###############################
###############################
###############################
###############################
###############################
###############################

set -e


##########################################
### Prepare the tempdirs and variables ###
##########################################
### Text colors in terminal outputs (usage: printf "${RED}red text ${NORMAL}normal text")
NORMAL=$(tput sgr0)
RED=$(tput setaf 1)
GREEN=$(tput setaf 2)
YELLOW=$(tput setaf 3)
BLUE=$(tput setaf 4)
BOLD=$(tput bold)

### Function to convert IUPAC codes in primers
function convert_IUPAC () {
echo $1 | \
if grep -q -E "R|Y|S|W|K|M|B|D|H|V|N|I"; then
    #define IUPAC codes
    R=$"[AG]"
    Y=$"[CT]"
    S=$"[GC]"
    W=$"[AT]"
    K=$"[GT]"
    M=$"[AC]"
    B=$"[CGT]"
    D=$"[AGT]"
    H=$"[ACT]"
    V=$"[ACG]"
    N=$"[ATGC]"
    I=$"[ATGC]"
    #replace IUPAC codes
    primer=$(echo $1 | \
    sed -e "s/R/$R/g; s/Y/$Y/g; \
    s/S/$S/g; s/W/$W/g; s/K/$K/g; \
    s/M/$M/g; s/B/$B/g; s/D/$D/g; \
    s/H/$H/g; s/V/$V/g; s/N/$N/g; \
    s/I/$I/g")
    #return convered primer
    echo $primer
else
    #return original primer when no IUPAC codes were detected
    echo $1
fi
}

#Format primer strings for reorienting:
    #check if IUPAC codes exist in primers and convert primers for reorienting
fwd_primer=$(convert_IUPAC $fwd_tempprimer)
rev_primer=$(convert_IUPAC $rev_tempprimer)

#Remove 'old' reoriented_out/ directory (new one will be generated below to overwrite the data)
if [ -d reoriented_out ]; then
    rm -rf reoriented_out
fi
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
mkdir -p tempdir2

#############################
### Start of the workflow ###
#############################
for file in *.$extension; do

    ### Make temporary directory for temp files
    if [ -d tempdir ]; then
        rm -rf tempdir
    fi 
    mkdir tempdir

    ### Preparing files for reorienting
    printf "\n${BOLD}____________________________________${NORMAL}\n"
    printf "Preparing ${BOLD}$file ${NORMAL}for reorienting ...\n"

    #Write file name without extension
    input=$(echo $file | sed -e "s/.$extension//")

    # First part of out files names
    outfile=$(echo $input | sed -e "s/.$extension//")

    #Read user specified input extension
    #If compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
    check_compress=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $NF}';))
    if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
        pigz --decompress --force --keep $input.$extension
        #Check errors
        if [ "$?" != "0" ]; then
            printf "${RED}[ERROR]: $input.$extension decompressing failed! File not compressed as gz or zip. \nDecompressing other formats is not supported, please decompress manually.\n \n${BOLD}Quitting\n${NORMAL}" && exit
        fi
        newextension=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $(NF-1)}';))
        export newextension
    else
        newextension=$extension
        export newextension
    fi


    #########################
    ### Start reorienting ###
    #########################
    printf "\n${BOLD}# Reorienting reads based on PCR primers:${NORMAL} \n"
    printf " forward primer(s): $fwd_tempprimer\n"
    printf " reverse primer(s): $rev_tempprimer\n"

    ### Reorient FASTQ reads based on fwd and rev primers (up to 13 fwd and rev primers allowed). 
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then

        #Reorient fastq
        fqgrep -m $mismatches -p $fwd_primer -e $input.$newextension > tempdir/5_3.fastq #seach fwd primer and write to file
        fqgrep -m $mismatches -p $rev_primer -e $input.$newextension > tempdir/3_5.fastq #search rev primer and write to file

        #if rev primer found, then make reverse complementary and merge with 5_3.fastq file
        if [ -s tempdir/3_5.fastq ]; then
            #rev.comp reverse primer file (=5'-3') and add to 5_3.fastq file
            fastx_reverse_complement -Q33 -i tempdir/3_5.fastq >> tempdir/5_3.fastq
        fi
    
    ### Reorient FASTA reads based on fwd and rev primers (up to 13 fwd and rev primers allowed).
    elif [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]] || [[ $newextension == "txt" ]]; then
        #Reorient fasta
        fqgrep -m $mismatches -p $fwd_primer -f -e $input.$newextension > tempdir/5_3.fasta #seach fwd primer and write to file
        fqgrep -m $mismatches -p $rev_primer -f -e $input.$newextension > tempdir/3_5.fasta #search rev primer and write to file

        #if rev primer found, then make reverse complementary and merge with 5_3.fasta file
        if [ -s tempdir/3_5.fasta ]; then
            #rev.comp reverse primer file (=5'-3') and add to 5_3.fasta file
            fastx_reverse_complement -Q33 -i tempdir/3_5.fasta >> tempdir/5_3.fasta
        fi
    else
        printf "\n${RED}[ERROR]: ${BOLD}$file ${NORMAL}${RED}formatting not supported!${NORMAL}\n${RED}Supported formats: fastq, fq, fasta, fa, fas, txt (and gz or zip compressed formats).\n${BOLD}Quitting${NORMAL}\n" \
        && exit 1
    fi


    ### Remove sequences that occur twice in the reoriented fastq/fasta file 
        #(i.e. remove chimeric sequences, because primer was found in 5'-3' read as well as in 3'-5' read)

    #If input is fastq file, then convert it to fasta for removing the chimeras (convert back to fastq later)
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    #fastq to fasta
        if [ -s tempdir/5_3.fastq ]; then
            vsearch --quiet --fastq_filter tempdir/5_3.fastq --fasta_width 0 --fastaout tempdir/5_3.fasta --fastq_qmax 93
        else
            printf "\n${YELLOW}[WARNING]: specified primers not found in ${BOLD}$input.$newextension ${NORMAL}${RED}(SKIPPING)${NORMAL}\n" \
            && rm -rf tempdir && continue
        fi
    fi

    printf "\n${BLUE}NOTE: some reads will be recoded twice while searching for FWD and REV primers.${NORMAL}\n"
    printf "${BLUE}These duplicates are chimeric reads and will be removed from the data set.${NORMAL}\n"

    #Chimera search
    sed -e 's/\t//g;s/ .*//g' < tempdir/5_3.fasta > tempdir/x.fasta.temp && rm tempdir/5_3.fasta #remove redundant tabs and spaces from seq headers, if there are some 'unallowed charachters'
    awk 'NR%2{printf "%s\t",$0;next;}1' tempdir/x.fasta.temp | sort > tempdir/sort.temp
    awk 'n=x[$1]{print n"\n"$0;} {x[$1]=$0;}' tempdir/sort.temp > tempdir/duplicates.temp
    comm -23 tempdir/sort.temp tempdir/duplicates.temp | sed -e 's/\t/\n/g' > tempdir/5_3.fasta
    dupl=$(wc -l tempdir/duplicates.temp | awk '{print $1}')
    dupl2=$(echo $((dupl/2)))
    printf "   - found $dupl2 'multi-primer' chimeric sequence(s) from ${BOLD}$outfile.$newextension ${NORMAL}\n"
    #Format chimeras fasta file
    if [ -s tempdir/duplicates.temp ]; then
        tr "\t" "\n" < tempdir/duplicates.temp > $outfile.chimeras.fasta && rm tempdir/duplicates.temp
    else
        rm tempdir/duplicates.temp
    fi


    ### FASTQ: prepare final output reoriented reads and move to 'reoriented_out/' dir
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
        #list non-duplicate reorianted sequences
        mothur --quiet "#list.seqs(fasta=tempdir/5_3.fasta)" &> /dev/null
        #get sequences from reoriented fastq file based on list of non-duplicate reorianted sequences (from previous step)
        mothur --quiet "#get.seqs(fastq=tempdir/5_3.fastq, accnos=tempdir/5_3.accnos)" &> /dev/null

        #Move mothur logfiles to tempdir
        mv mothur.*.logfile tempdir/
        #Rename final fastq
        mv tempdir/5_3.pick.fastq tempdir/$outfile.reoriented.$newextension

        # Move final output to reoriented_out
        mkdir -p reoriented_out
        mv tempdir/$outfile.reoriented.$newextension reoriented_out/$outfile.reoriented.$newextension
    fi 

    ### FASTA: prepare final output reoriented reads and move to 'reoriented_out/' dir
    if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]] || [[ $newextension == "txt" ]]; then
        mv tempdir/5_3.fasta tempdir/$outfile.reoriented.$newextension

        # Move final output to reoriented_out
        mkdir -p reoriented_out
        mv tempdir/$outfile.reoriented.$newextension reoriented_out/$outfile.reoriented.$newextension
    fi

    ### Move chimeras to 'reoriented_out/' dir
    mkdir -p reoriented_out/chimeras
    if [ -s $outfile.chimeras.fasta ]; then
        mv $outfile.chimeras.fasta reoriented_out/chimeras
    fi


    ### Check if reoriented output is empty; if yes, then report WARNING
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
        if [ -s reoriented_out/$outfile.reoriented.$newextension ]; then
            size=$(echo $(cat reoriented_out/$outfile.reoriented.$newextension | wc -l) / 4 | bc)
            printf "$size sequences in $outfile.reoriented.$newextension\n"
        else
            printf "${YELLOW}[WARNING]: primers not found in file $outfile (no output)${NORMAL}\n"
            rm reoriented_out/$outfile.reoriented.$newextension
        fi
    fi
    if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]] || [[ $newextension == "txt" ]]; then
        if [ -s reoriented_out/$outfile.reoriented.$newextension ]; then
            size=$(grep -c ">" reoriented_out/$outfile.reoriented.$newextension)
            printf "$size sequences in $outfile.reoriented.$newextension\n"
        else
            printf "${YELLOW}[WARNING]: primers not found in file $outfile (no output)${NORMAL}\n"
            rm reoriented_out/$outfile.reoriented.$newextension
        fi
    fi
done


#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\n${BOLD}Cleaning up and compiling final stats files ...${NORMAL}\n"


### Count reads before after reorienting (to seq_count_after_reorient.txt)
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    touch tempdir2/seq_count_before_reorient.txt
    for file in *.$newextension; do
        size=$(echo $(cat $file | wc -l) / 4 | bc)
        printf "$file\t$size\n" >> tempdir2/seq_count_before_reorient.txt
    done

    touch tempdir2/seq_count_after_reorient.txt
    for file in reoriented_out/*.reoriented.$newextension; do
        size=$(echo $(cat $file | wc -l) / 4 | bc)
        printf "$file\t$size\n" >> tempdir2/seq_count_after_reorient.txt
    done
fi
if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]] || [[ $newextension == "txt" ]]; then
    touch tempdir2/seq_count_before_reorient.txt
    for file in *.$newextension; do
        size=$(grep -c ">" $file)
        printf "$file\t$size\n" >> tempdir2/seq_count_before_reorient.txt
    done

    touch tempdir2/seq_count_after_reorient.txt
    for file in reoriented_out/*.reoriented.$newextension; do
        size=$(grep -c ">" $file)
        printf "$file\t$size\n" >> tempdir2/seq_count_after_reorient.txt
    done
fi


### Compile a track reads summary file (seq_count_summary_reorient.txt)
sed -e 's/.reoriented//' < tempdir2/seq_count_after_reorient.txt | \
sed -e 's/reoriented_out\///' > tempdir2/seq_count_after_reorient.temp

printf "File\tReads\tReoriented_reads\n" > reoriented_out/seq_count_summary_reorient.txt
while read LINE; do
    file1=$(echo $LINE | awk '{print $1}')
    count1=$(echo $LINE | awk '{print $2}')
    
    while read LINE2; do
        file2=$(echo $LINE2 | awk '{print $1}')
        count2=$(echo $LINE2 | awk '{print $2}')
        if [ "$file1" == "$file2" ]; then
            printf "$file1\t$count1\t$count2\n" >> reoriented_out/seq_count_summary_reorient.txt
        fi
    done < tempdir2/seq_count_after_reorient.temp

    #Report file where no sequences were reoriented (i.e. the output was 0)
    grep -Fq $file1 tempdir2/seq_count_after_reorient.temp
    if [[ $? != 0 ]]; then
        printf "$file1\t$count1\t0\n" >> reoriented_out/seq_count_summary_reorient.txt
    fi
done < tempdir2/seq_count_before_reorient.txt && rm -rf tempdir2

#Delete tempdir
if [ -d tempdir ]; then
    rm -rf tempdir
fi

#Note for counting seqs
printf "\nPlease note that sequence count assumes that there are 4 lines per sequence in a FASTQ file (as this is mostly the case).
You may double-check the sequence count of one file using implemented 'FastQC' program in PipeCraft.\n" >> reoriented_out/seq_count_summary_reorient.txt

#Make README.txt file for multi-primer chimeras
printf "If there are some fasta files in that directory here,
then the sequences in these files were considered as chimeric ones and removed from the reorianted data set.
Note that the sequences are recorded twice in the fasta files: in forward and reverse complementary strands.\n\n
Logic behind considering these seqs as chimeric ones:
PCR primer strings were specified in orientation they are used in a PCR; i.e.
forward primer in 5'-3' orientation and reverse primer in 3'-5' orientation.
[IF THAT WAS NOT THE CASE, THEN RUN THIS STEP AGAIN!]
Therefore if a forward primer string was found in a sequence,
but also a reverse primer sting was found in the same sequence,
the sequence consists of 5'-3' and 3'-5' oriented fragments.
It is highly likely that this sequence is a chimeric one, and therefore removed.
Usually only very few such 'multi-primer' chimeric sequences are found in the amplicon data sets.\n" > reoriented_out/chimeras/README.txt

#Make README.txt file for reoriented reads
printf "*.reoriented.fastq (or fasta) files here represent sequences that have been reoriented (5'-3') based on PCR primers.
Forward primer(s) [has to be 5'-3']: $fwd_tempprimer
Reverse primer(s) [has to be 3'-5']: $rev_tempprimer
[If primers were not specified in orientations noted above, please run this step again].\n
If data was compressed (gz or zip), then it was uncompressed by keeping the original compressed file.
If you do not need to use the uncompressed data further, you may delete these duplicates to save disk space.\n
Note that, when applicable, then ':' symbols in the sequence headers (before space or tab) are changed to '_'\n.
NOTE RUNNING THE PROCESS SEVERAL TIMES IN THE SAME DIRECTORY WILL OVERWRITE ALL THE OUTPUTS!" > reoriented_out/README.txt


printf "\n${GREEN}${BOLD}DONE${NORMAL}\n"
printf "${GREEN}Data in directory ${BOLD}'reoriented_out'${NORMAL}\n"
printf "${GREEN}Summary of sequence counts in ${BOLD}'reoriented_out/seq_count_summary_reorient.txt'${NORMAL}\n"
printf "${GREEN}Check ${BOLD}README.txt ${NORMAL}${GREEN}files in output directory for further information about the process.${NORMAL}\n\n"
