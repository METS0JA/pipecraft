#!/bin/bash

#Input = fastq files.

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


echo 'Variable check'

###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
IFS=',' read -r -a array1 <<< "$forward_primers"
IFS=',' read -r -a array2 <<< "$reverse_primers"

for element in "${array1[@]}"
do
    echo "$element"
done

for element in "${array2[@]}"
do
    echo "$element"
done

echo $R1
echo $R2
echo $mismatches
echo $readType
echo $dataFormat
echo $fileFormat
echo $workingDir

echo 'Variable check complete'

extension=$"fastq.gz"
# mismatches=$"2"
fwd_tempprimer=$"ACCTGCTAGGCTAGATGC"
rev_tempprimer=$"GGGATCCATCGATTTAAC"

# fwd_tempprimer=$"ACCTGCGGARGGATCA"
# rev_tempprimer=$"GAGATCCRTTGYTRAAAGTT"



# The BITS3 (forward) and B58S3 (reverse) primers were used to amplify dada2 ITS tutorial dataset. 
# We record the DNA sequences, including ambiguous nucleotides, for those primers.
# FWD <- "ACCTGCGGARGGATCA"  REV <- "GAGATCCRTTGYTRAAAGTT"

###############################
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
# NORMAL=$(tput sgr0)
# RED=$(tput setaf 1)
# GREEN=$(tput setaf 2)
# YELLOW=$(tput setaf 3)
# BLUE=$(tput setaf 4)
# BOLD=$(tput bold)

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

#Make tempdir2
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
mkdir -p tempdir2


### Make a file where to read R1 and R2 file names for paired-end read processing.
if [ -s tempdir2/paired_end_files.txt ]; then
    rm tempdir2/paired_end_files.txt
fi
if [ -s tempdir2/files_in_folder.txt ]; then
    rm tempdir2/files_in_folder.txt
fi


touch tempdir2/files_in_folder.txt
for file in *.$extension; do
    echo $file >> tempdir2/files_in_folder.txt
done
    #Get only R1 reads
grep "R1"  < tempdir2/files_in_folder.txt > tempdir2/paired_end_files.txt || true
    #Check if everything is ok considering file names


if [ -s tempdir2/paired_end_files.txt ]; then
    :
else
    # BEFORE
    
    # printf "\n${RED}[ERROR]: No paired-end read files found.\nFile names must contain ${BOLD}'R1' and 'R2' ${NORMAL}${RED}strings! (e.g. s01_R1.fastq and s01_R2.fastq)${NORMAL}\n" \ 
    # && exit 1

    # AFTER
    printf '%s\n' "[ERROR]: No paired-end read files found. File names must contain 'R1' and 'R2' strings! (e.g. s01_R1.fastq and s01_R2.fastq)">&2 # write error message to stderr
    exit 1
fi




#############################
### Start of the workflow ###
#############################
### Read through each file in paired_end_files.txt
while read LINE; do
    ### Make temporary directory for temp files
    if [ -d tempdir ]; then
        rm -rf tempdir
    fi 
    mkdir tempdir

    #Write file name without extension
    inputR1=$(echo $LINE | sed -e "s/.$extension//")
    inputR2=$(echo $inputR1 | sed -e 's/R1/R2/')

    ## Preparing files for reorienting
    printf "\n${BOLD}____________________________________${NORMAL}\n"
    printf "Preparing ${BOLD}$inputR1 and $inputR2 ${NORMAL}for reorienting ...\n"

    #Read user specified input extension
    #If compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
    check_compress=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $NF}';))
    if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
        pigz --decompress --force --keep $inputR1.$extension
        #Check errors
        if [ "$?" != "0" ]; then
            printf "${RED}[ERROR]: $inputR1.$extension decompressing failed! File not compressed as gz or zip. \nDecompressing other formats is not supported, please decompress manually.\n \n${BOLD}Quitting\n${NORMAL}" && exit 1
        fi
        pigz --decompress --force --keep $inputR2.$extension
        #Check errors
        if [ "$?" != "0" ]; then
            printf "${RED}[ERROR]: $inputR2.$extension file decompressing failed! File not compressed as gz or zip. \nDecompressing other formats is not supported, please decompress manually.\n \n${BOLD}Quitting\n${NORMAL}" && exit 1
        fi
        newextension=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $(NF-1)}';))
        export newextension
    else
        newextension=$extension
        export newextension
    fi

    ### Check input formats (only fastq/fq supported)
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
        :
    else
        printf "\n${RED}[ERROR]: ${BOLD}$file ${NORMAL}${RED}formatting not supported!${NORMAL}\n${RED}Supported formats: fastq, fq (and gz or zip compressed formats).\n${BOLD}Quitting${NORMAL}\n" \
        && exit 1
    fi


    #########################
    ### Start reorienting ###
    #########################
    printf "\n${BOLD}# Reorienting paired-end reads based on PCR primers:${NORMAL} \n"
    printf " forward primer(s): $fwd_tempprimer\n"
    printf " reverse primer(s): $rev_tempprimer\n"
    ### Reorient FASTQ reads based on fwd and rev primers (up to 13 fwd and rev primers allowed). 


    #R1
    fqgrep -m $mismatches -p $fwd_primer -e $inputR1.$newextension > tempdir/R1.5_3.fastq #seach fwd primer and write to file
    fqgrep -m $mismatches -p $rev_primer -e $inputR1.$newextension > tempdir/R1.3_5.fastq #search rev primer and write to file

    #if rev primer found, then make reverse complementary and merge with 5_3.fastq file
    if [ -s tempdir/R1.3_5.fastq ]; then
        #rev.comp reverse primer file (=5'-3') and add to 5_3.fastq file
        fastx_reverse_complement -Q33 -i tempdir/R1.3_5.fastq >> tempdir/R1.5_3.fastq
    fi

    #R2
    fqgrep -m $mismatches -p $fwd_primer -e $inputR2.$newextension > tempdir/R2.5_3.fastq #seach fwd primer and write to file
    fqgrep -m $mismatches -p $rev_primer -e $inputR2.$newextension > tempdir/R2.3_5.fastq #search rev primer and write to file

    #if rev primer found, then make reverse complementary and merge with 5_3.fastq file
    if [ -s tempdir/R2.5_3.fastq ]; then
        #rev.comp reverse primer file (=5'-3') and add to 3_5.fastq file
        fastx_reverse_complement -Q33 -i tempdir/R2.5_3.fastq >> tempdir/R2.3_5.fastq
    fi


    ### Remove sequences that occur twice in the reoriented fastq file 
        #(i.e. remove chimeric sequences, because primer was found in 5'-3' read as well as in 3'-5' read)
    printf "\n${BLUE}NOTE: some reads will be recoded twice while searching for FWD and REV primers.${NORMAL}\n"
    printf "${BLUE}These duplicates are chimeric reads and will be removed from the data set.${NORMAL}\n"

    #fastq to fasta
    if [ -s tempdir/R1.5_3.fastq ]; then
        vsearch --quiet --fastq_filter tempdir/R1.5_3.fastq --fasta_width 0 --fastaout tempdir/R1.5_3.fasta --fastq_qmax 93
    else
        printf "\n${YELLOW}[WARNING]: specified primers not found in ${BOLD}$inputR1.$newextension ${NORMAL}${RED}(SKIPPING; also $inputR2.$newextension)${NORMAL}\n" \
        && rm -rf tempdir && continue
    fi
    if [ -s tempdir/R2.3_5.fastq ]; then
        vsearch --quiet --fastq_filter tempdir/R2.3_5.fastq --fasta_width 0 --fastaout tempdir/R2.3_5.fasta --fastq_qmax 93
    else
        printf "\n${YELLOW}[WARNING]: specified primers not found in ${BOLD}$inputR2.$newextension ${NORMAL}${RED}(SKIPPING; also $inputR1.$newextension)${NORMAL}\n" \
        && rm -rf tempdir && continue
    fi


    #R1 chimera search
    sed -e 's/\t//g;s/ .*//g' < tempdir/R1.5_3.fasta > tempdir/x.fasta.temp && rm tempdir/R1.5_3.fasta #remove redundant tabs and spaces from seq headers, if there are some 'unallowed charachters'
    awk 'NR%2{printf "%s\t",$0;next;}1' tempdir/x.fasta.temp | sort > tempdir/sort.temp
    awk 'n=x[$1]{print n"\n"$0;} {x[$1]=$0;}' tempdir/sort.temp > tempdir/duplicates.temp
    comm -23 tempdir/sort.temp tempdir/duplicates.temp | sed -e 's/\t/\n/g' > tempdir/R1.5_3.fasta
    dupl=$(wc -l tempdir/duplicates.temp | awk '{print $1}')
    dupl2=$(echo $((dupl/2)))
    printf "   - found $dupl2 'multi-primer' chimeric sequence(s) from ${BOLD}$inputR1.$newextension ${NORMAL}\n"
    #Format chimeras fasta file
    if [ -s tempdir/duplicates.temp ]; then
        tr "\t" "\n" < tempdir/duplicates.temp > $inputR1.chimeras.fasta && rm tempdir/duplicates.temp
    else
        rm tempdir/duplicates.temp
    fi

    #R2 chimera search
    sed -e 's/\t//g;s/ .*//g' < tempdir/R2.3_5.fasta > tempdir/x.fasta.temp && rm tempdir/R2.3_5.fasta #remove redundant tabs and spaces from seq headers, if there are some 'unallowed charachters'
    awk 'NR%2{printf "%s\t",$0;next;}1' tempdir/x.fasta.temp | sort > tempdir/sort.temp
    awk 'n=x[$1]{print n"\n"$0;} {x[$1]=$0;}' tempdir/sort.temp > tempdir/duplicates.temp
    comm -23 tempdir/sort.temp tempdir/duplicates.temp | sed -e 's/\t/\n/g' > tempdir/R2.3_5.fasta
    dupl=$(wc -l tempdir/duplicates.temp | awk '{print $1}')
    dupl2=$(echo $((dupl/2)))
    printf "   - found $dupl2 'multi-primer' chimeric sequence(s) from ${BOLD}$inputR2.$newextension ${NORMAL}\n"
    #Format chimeras fasta file
    if [ -s tempdir/duplicates.temp ]; then
        tr "\t" "\n" < tempdir/duplicates.temp > $inputR2.chimeras.fasta && rm tempdir/duplicates.temp
    else
        rm tempdir/duplicates.temp
    fi


    ### Prepare final output reoriented fastq reads
    #list non-duplicate reorianted sequences
    mothur --quiet "#list.seqs(fasta=tempdir/R1.5_3.fasta)" &> /dev/null
    mothur --quiet "#list.seqs(fasta=tempdir/R2.3_5.fasta)" &> /dev/null
    #get sequences from reoriented fastq file based on list of non-duplicate reorianted sequences (from previous step)
    mothur --quiet "#get.seqs(fastq=tempdir/R1.5_3.fastq, accnos=tempdir/R1.5_3.accnos)" &> /dev/null
    mothur --quiet "#get.seqs(fastq=tempdir/R2.3_5.fastq, accnos=tempdir/R2.3_5.accnos)" &> /dev/null

    mv tempdir/R1.5_3.pick.fastq tempdir/$inputR1.reoriented.$newextension
    mv tempdir/R2.3_5.pick.fastq tempdir/$inputR2.reoriented.$newextension

    #Move mothur logfiles to tempdir
    mv mothur.*.logfile tempdir/
        
    #pair R1 and R2 seqs (synchronize)
    printf "\nSynchronizing R1 and R2 reads (matching order for paired-end reads merging)\n"
    cd tempdir && \
    seqkit pair -1 $inputR1.reoriented.$newextension -2 $inputR2.reoriented.$newextension --quiet
    rm $inputR1.reoriented.$newextension
    rm $inputR2.reoriented.$newextension
    mv $inputR1.reoriented.paired.$newextension $inputR1.reoriented.$newextension
    mv $inputR2.reoriented.paired.$newextension $inputR2.reoriented.$newextension
    cd ..
    #make dir for final outputs and move files
    mkdir -p reoriented_out
    mv tempdir/$inputR1.reoriented.$newextension reoriented_out/$inputR1.reoriented.$newextension
    mv tempdir/$inputR2.reoriented.$newextension reoriented_out/$inputR2.reoriented.$newextension


    ### Move chimeras to 'reoriented_out/' dir
    mkdir -p reoriented_out/chimeras
    if [ -s $inputR1.chimeras.fasta ]; then
        mv $inputR1.chimeras.fasta reoriented_out/chimeras
    fi
    if [ -s $inputR2.chimeras.fasta ]; then
        mv $inputR2.chimeras.fasta reoriented_out/chimeras
    fi


    ### Check if reoriented output is empty; if yes, then report WARNING
    if [ -s reoriented_out/$inputR1.reoriented.$newextension ]; then
        size=$(echo $(cat reoriented_out/$inputR1.reoriented.$newextension | wc -l) / 4 | bc)
        printf "$size sequences in $inputR1.reoriented.$newextension\n"
    else
        printf "${YELLOW}[WARNING]: after synchronizing, $inputR1 has 0 seqs (no output)${NORMAL}\n"
        rm reoriented_out/$inputR1.reoriented.$newextension
    fi

    if [ -s reoriented_out/$inputR2.reoriented.$newextension ]; then
        size=$(echo $(cat reoriented_out/$inputR2.reoriented.$newextension | wc -l) / 4 | bc)
        printf "$size sequences in $inputR2.reoriented.$newextension\n"
    else
        printf "${YELLOW}[WARNING]: after synchronizing, $inputR2 has 0 seqs (no output)${NORMAL}\n"
        rm reoriented_out/$inputR2.reoriented.$newextension
    fi

done < tempdir2/paired_end_files.txt


#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\n${BOLD}Cleaning up and compiling final stats files ...${NORMAL}\n"
# Count input reads (to seq_count_before_reorient.txt)
touch tempdir2/seq_count_before_reorient.txt
for file in *.$newextension; do
    size=$(echo $(cat $file | wc -l) / 4 | bc)
    printf "$file\t$size\n" >> tempdir2/seq_count_before_reorient.txt
done

### Count reads after reorienting (to seq_count_after_reorient.txt)
touch tempdir2/seq_count_after_reorient.txt
for file in reoriented_out/*.reoriented.$newextension; do
    size=$(echo $(cat $file | wc -l) / 4 | bc)
    printf "$file\t$size\n" >> tempdir2/seq_count_after_reorient.txt
done

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
printf "*.reoriented.fastq files here represent sequences that have been reoriented based on PCR primers.
Forward primer(s) [has to be 5'-3']: $fwd_tempprimer
Reverse primer(s) [has to be 3'-5']: $rev_tempprimer
[If primers were not specified in orientations noted above, please run this step again].\n
Output R1 and R2 reads have been synchronized for merging paired-end data. 
(R1 reads are 5'-3' oriented and R2 reads 3'-5' oriented (for merging paired-end data)).\n
If data was compressed (gz or zip), then it was uncompressed by keeping the original compressed file.
If you do not need to use the uncompressed data further, you may delete these duplicates to save disk space.\n
Note that, when applicable, then ':' symbols in the sequence headers (before space or tab) are changed to '_'.
This does not affect merging paired-end reads using PipeCraft implemented software.\n
NOTE RUNNING THE PROCESS SEVERAL TIMES IN THE SAME DIRECTORY WILL OVERWRITE ALL THE OUTPUTS!" > reoriented_out/README.txt


#Delete tempdir
if [ -d tempdir ]; then
    rm -rf tempdir
fi

printf "\n${GREEN}${BOLD}DONE${NORMAL}\n"
printf "${GREEN}Data in directory ${BOLD}'reoriented_out'${NORMAL}\n"
printf "${GREEN}Summary of sequence counts in ${BOLD}'reoriented_out/seq_count_summary_reorient.txt'${NORMAL}\n"
printf "${GREEN}Check ${BOLD}README.txt ${NORMAL}${GREEN}files in output directory for further information about the process.${NORMAL}\n\n"
printf ""

printf "workingDir=/input/reorient-out\n"
printf "fileFormat=$extension\n"
printf "dataFormat=$dataFormat\n"
printf "readType=paired-end\n"
