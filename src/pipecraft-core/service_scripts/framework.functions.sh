#!/bin/bash

# Set of functions for PipeCraft (2.0) workflows, for checking data integrity.

###############################
### Quit process upon ERROR ###
###############################
function end_process () {
if [ -d tempdir ]; then
    rm -rf tempdir
fi
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
exit 1
}
export -f end_process

#######################################
### Check if APP run was successful ###
#######################################
function check_app_error () {
if [ "$?" = "0" ]; then
    :
else
    printf '%s\n' "ERROR]: $checkerror" >&2
    end_process
fi
}
export -f check_app_error

##################################################
### Function to convert IUPAC codes in primers ###
##################################################
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

#################################################################
### Check if files with specified extension exist in the dir ###
#################################################################
function first_file_check () {
count=$(ls -1 *.$extension 2>/dev/null | wc -l)
if [ $count != 0 ]; then 
    :
else
    printf '%s\n' "ERROR]: cannot find files with specified extension '$extension'
Please check the extension of your files and specify again.
>Quitting" >&2
    end_process
fi 
}


####################################################
### Check PAIRED-END data and pepare working env ###
####################################################
function prepare_PE_env () {
#Remove 'old' output_dir if exist and make new empty one
if [ -d $output_dir ]; then
    rm -rf $output_dir
fi
mkdir $output_dir
#Make tempdir2, for seq count statistics
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
mkdir -p tempdir2
#Make a file where to read R1 and R2 file names for paired-end read processing.
touch tempdir2/files_in_folder.txt
for file in *.$extension; do
    echo $file >> tempdir2/files_in_folder.txt
done
#Check for empty spaces in the files names. Replace with _
while read file; do
    if [[ $file == *" "* ]]; then
        printf '%s\n' "WARNING]: File $file name contains empty spaces, replaced 'space' with '_'" >&2
        rename 's/ /_/g' "$file"
    fi
done < tempdir2/files_in_folder.txt
#Fix also names in files_in_folder file if they contained space
sed -i 's/ /_/g' tempdir2/files_in_folder.txt
#Check if R1 string is in the file name (if so, then assume that then reverse file has R2 in the file name)
grep "R1" < tempdir2/files_in_folder.txt > tempdir2/paired_end_files.txt || true
    #Check if everything is ok considering file names
if [ -s tempdir2/paired_end_files.txt ]; then
    :
else
    printf '%s\n' "ERROR]: no paired-end read files found.
File names must contain 'R1' and 'R2' strings! (e.g. s01_R1.fastq and s01_R2.fastq)
>Quitting" >&2
    end_process
fi
#Check multiple occurrences of R1 and R2 strings (e.g. R123.R1.fq). 
while read file; do
    x=$(echo $file | grep -o -E '(R1|R2)' | wc -l)
    if [[ $x == "1" ]]; then
        :
    elif [[ $x == "0" ]]; then
        printf '%s\n' "ERROR]: $file name does not contain R1 or R2 strings to identify paired-end reads. Remove file from folder or fix the name.
>Quitting" >&2
        end_process
    else    
        printf '%s\n' "ERROR]: $file name contains multiple R1 or R2 strings -> change names (e.g. R123.R1.fastq to S123.R1.fastq)
>Quitting" >&2
        end_process
    fi
done < tempdir2/files_in_folder.txt
}


####################################################
### Check SINGLE-END data and pepare working env ###
####################################################
function prepare_SE_env () {
if [ -d $output_dir ]; then
    rm -rf $output_dir
fi
mkdir $output_dir
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
mkdir -p tempdir2
}


#######################################################################
### Check if single-end files are compressed (decompress and check) ###
#######################################################################
#If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
    #$extension will be $newextension
function check_gz_zip_SE () {
    #Read user specified input extension
    #If compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
    check_compress=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $NF}';))
    if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
        pigz --decompress --force --keep $input.$extension
        #Check errors
        if [ "$?" != "0" ]; then
            printf '%s\n' "ERROR]: $input.$extension decompressing failed! File not compressed as gz or zip.
Decompressing other formats is not supported, please decompress manually.
>Quitting" >&2 
            quit_process      
        fi
        newextension=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $(NF-1)}';))
        export newextension
    else
        newextension=$extension
        export newextension
    fi
}


#######################################################################
### Check if paired-end files are compressed (decompress and check) ###
#######################################################################
#If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
    #$extension will be $newextension
function check_gz_zip_PE () {
check_compress=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $NF}';))
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    pigz --decompress --force --keep $inputR1.$extension
    #Check errors
    if [ "$?" != "0" ]; then
        printf '%s\n' "ERROR]: $inputR1.$extension decompressing failed! File not compressed as gz or zip.
Decompressing other formats is not supported, please decompress manually.
>Quitting" >&2
        end_process
    fi
    pigz --decompress --force --keep $inputR2.$extension
    #Check errors
    if [ "$?" != "0" ]; then
        printf '%s\n' "ERROR]: $inputR2.$extension decompressing failed! File not compressed as gz or zip.
Decompressing other formats is not supported, please decompress manually.
>Quitting" >&2
        end_process
    fi
    newextension=$(echo $extension | (awk 'BEGIN{FS=OFS="."} {print $(NF-1)}';))
    export newextension
else
    newextension=$extension
    export newextension
    fi
### Double-check input formats (only fastq/fq supported)
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    :
else
    printf '%s\n' "ERROR]: $file formatting not supported here!
Supported extensions: fastq, fq (and gz or zip compressed formats).
>Quitting" >&2
    end_process
    fi
}


#######################################
### Check file formatting for FASTQ ###
#######################################
function check_extension_fastq () {
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    :
else
    printf '%s\n' "ERROR]: $file formatting not supported here!
Supported extensions: fastq, fq (and gz or zip compressed formats).
>Quitting" >&2
    end_process
fi
}

#######################################
### Check file formatting for FASTA ###
#######################################
function check_extension_fasta () {
if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]]; then
    :
else
    printf '%s\n' "ERROR]: $file formatting not supported here!
Supported extensions: fasta, fas, fa (and gz or zip compressed formats).
>Quitting" >&2
    end_process
fi
}

#########################################
### Check file formatting for FASTQ/A ###
#########################################
function check_extension_fastx () {
if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]] || [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    :
else
    printf '%s\n' "ERROR]: $file formatting not supported here!
Supported extensions: fastq, fq, fasta, fas, fa (and gz or zip compressed formats).
>Quitting" >&2
    end_process
fi
}


#############################################################################
### Cleaning up and compiling final stats file, only for assemble PE data ###
#############################################################################
function clean_and_make_stats_Assemble_Demux () {
#Delete empty output files
find $output_dir -empty -type f -delete
# Count input reads
touch tempdir2/seq_count.txt
for file in *.$newextension; do
    size=$(echo $(cat $file | wc -l) / 4 | bc)
    printf "$file\t$size\n" >> tempdir2/seq_count.txt
done
### Count reads after the process
touch tempdir2/seq_count_after.txt
outfile_check=$(ls $output_dir/*.$newextension 2>/dev/null | wc -l)
if [ $outfile_check != 0 ]; then 
    for file in $output_dir/*.$newextension; do
        size=$(echo $(cat $file | wc -l) / 4 | bc)
        filename=$(echo $file | sed -e "s/\/input\/demultiplex_out\///")
        printf "$filename\t$size\n" >> tempdir2/seq_count_after.txt
    done
else 
    printf '%s\n' "ERROR]: no output files generated ($output_dir). Adjust settings." >&2
    end_process
fi
### Compile a track reads summary file (seq_count_summary_demultiplex.txt)
printf "File\tReads\n" > $output_dir/seq_count_summary.txt
while read LINE; do
    file1=$(echo $LINE | awk '{print $1}')
    count1=$(echo $LINE | awk '{print $2}')
    printf "$file1\t$count1\n" >> $output_dir/seq_count_summary.txt    
done < tempdir2/seq_count.txt
printf "\nPROCESSED files:\n" >> $output_dir/seq_count_summary.txt
while read LINE; do
    file1=$(echo $LINE | awk '{print $1}')
    count1=$(echo $LINE | awk '{print $2}')
    printf "$file1\t$count1\n" >> $output_dir/seq_count_summary.txt    
done < tempdir2/seq_count_after.txt #&& rm -rf tempdir2
#Delete decompressed files if original set of files were compressed
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    rm *.$newextension
fi
#Note for counting seqs
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    printf "\nPlease note that sequence count assumes that there are 4 lines per sequence in a FASTQ file (as this is mostly the case).
You may double-check the sequence count of one file using implemented 'FastQC' program in PipeCraft.\n" >> $output_dir/seq_count_summary.txt
fi
}


################################################################################################################
### Cleaning up and compiling final stats file UNIVERSAL fastx (but not for PE assembly and demux and GeneX) ###
################################################################################################################
function clean_and_make_stats () {
#Delete empty output files
find $output_dir -empty -type f -delete
### Count reads before and after the process
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    touch tempdir2/seq_count_before.txt
    for file in *.$newextension; do
        size=$(echo $(cat $file | wc -l) / 4 | bc)
        printf "$file\t$size\n" >> tempdir2/seq_count_before.txt
    done
    touch tempdir2/seq_count_after.txt
    outfile_check=$(ls $output_dir/*.$newextension 2>/dev/null | wc -l)
	if [ $outfile_check != 0 ]; then 
	    for file in $output_dir/*.$outfile_addition.$newextension; do
	        size=$(echo $(cat $file | wc -l) / 4 | bc)
	        printf "$file\t$size\n" >> tempdir2/seq_count_after.txt
	    done
	else
		printf '%s\n' "ERROR]: no output files generated ($output_dir). Check settings!" >&2
    	end_process
	fi
fi
if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]]; then
    touch tempdir2/seq_count_before.txt
    for file in *.$newextension; do
        size=$(grep -c "^>" $file)
        printf "$file\t$size\n" >> tempdir2/seq_count_before.txt
    done
    touch tempdir2/seq_count_after.txt
    outfile_check=$(ls $output_dir/*.$newextension 2>/dev/null | wc -l)
	if [ $outfile_check != 0 ]; then 
	    for file in $output_dir/*.$outfile_addition.$newextension; do
	        size=$(grep -c "^>" $file)
	        printf "$file\t$size\n" >> tempdir2/seq_count_after.txt
	    done
	else
		printf '%s\n' "ERROR]: no output files generated ($output_dir). Check settings!" >&2
    	end_process
	fi
fi
### Compile a track reads summary file (seq_count_summary.txt)
output_dir_for_sed=$(echo $output_dir | sed -e "s/\//\\\\\//g")
sed -e "s/\.$outfile_addition//" < tempdir2/seq_count_after.txt | \
sed -e "s/$output_dir_for_sed\///" > tempdir2/seq_count_after.temp
printf "File\tReads\tProcessed_reads\n" > $output_dir/seq_count_summary.txt
while read LINE; do
    file1=$(echo $LINE | awk '{print $1}')
    count1=$(echo $LINE | awk '{print $2}')
    while read LINE2; do
        file2=$(echo $LINE2 | awk '{print $1}')
        count2=$(echo $LINE2 | awk '{print $2}')
        if [ "$file1" == "$file2" ]; then
            printf "$file1\t$count1\t$count2\n" >> $output_dir/seq_count_summary.txt
        fi
    done < tempdir2/seq_count_after.temp
    #Report file where no sequences were reoriented (i.e. the output was 0)
    grep -Fq $file1 tempdir2/seq_count_after.temp
    if [[ $? != 0 ]]; then
        printf "$file1\t$count1\t0\n" >> $output_dir/seq_count_summary.txt
    fi
done < tempdir2/seq_count_before.txt && rm -rf tempdir2

#Note for counting seqs in FASTQ files
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
	printf "\nPlease note that sequence count assumes that there are 4 lines per sequence in a FASTQ file (as this is mostly the case).
You may double-check the sequence count of one file using implemented 'FastQC' program in PipeCraft.\n" >> $output_dir/seq_count_summary.txt
fi

#Delete decompressed files if original set of files were compressed
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    rm *.$newextension
fi
#Remove mothur logfiles
mothur_logfiles=$(ls -1 *.logfile 2>/dev/null | wc -l)
if [ $mothur_logfiles != 0 ]; then 
    rm mothur.*.logfile 
fi
#Delete tempdir
if [ -d tempdir ]; then
    rm -rf tempdir
fi
}


########################################################################################
### Cleaning up and compiling final stats file, when outputting multiple directories ###
########################################################################################
function clean_and_make_stats_multidir () {
### Count reads before and after the process
mkdir -p tempdir2

if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    touch tempdir2/seq_count_before.txt
    for file in *.$newextension; do
        size=$(echo $(cat $file | wc -l) / 4 | bc)
        printf "$file\t$size\n" >> tempdir2/seq_count_before.txt
    done
    touch tempdir2/seq_count_after.txt
    outfile_check=$(ls $output_dir/$subdir/*.$newextension 2>/dev/null | wc -l)
    if [ $outfile_check != 0 ]; then 
        for file in $output_dir/$subdir/*.$outfile_addition.$newextension; do
            size=$(echo $(cat $file | wc -l) / 4 | bc)
            printf "$file\t$size\n" >> tempdir2/seq_count_after.txt
        done
    else
        printf '%s\n' "ERROR]: no output files generated ($output_dir). Check settings!" >&2
        end_process
    fi
fi
if [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]]; then
    touch tempdir2/seq_count_before.txt
    for file in *.$newextension; do
        size=$(grep -c "^>" $file)
        printf "$file\t$size\n" >> tempdir2/seq_count_before.txt
    done
    touch tempdir2/seq_count_after.txt
    outfile_check=$(ls $output_dir/$subdir/*.$newextension 2>/dev/null | wc -l)
    if [ $outfile_check != 0 ]; then 
        for file in $output_dir/$subdir/*.$outfile_addition.$newextension; do
            size=$(grep -c "^>" $file)
            printf "$file\t$size\n" >> tempdir2/seq_count_after.txt
        done
    else
        printf '%s\n' "ERROR]: no output files generated ($output_dir). Check settings!" >&2
        end_process
    fi
fi
### Compile a track reads summary file (seq_count_summary.txt)
sed -e "s/\.$outfile_addition//" < tempdir2/seq_count_after.txt | \
sed -e "s/^$output_dir\///" | sed -e "s/^$subdir\///" > tempdir2/seq_count_after.temp
printf "File\tReads\tProcessed_reads\n" > $output_dir/$subdir/seq_count_summary.txt
while read LINE; do
    file1=$(echo $LINE | awk '{print $1}')
    count1=$(echo $LINE | awk '{print $2}')
    while read LINE2; do
        file2=$(echo $LINE2 | awk '{print $1}')
        count2=$(echo $LINE2 | awk '{print $2}')
        if [ "$file1" == "$file2" ]; then
            printf "$file1\t$count1\t$count2\n" >> $output_dir/$subdir/seq_count_summary.txt
        fi
    done < tempdir2/seq_count_after.temp
    #Report file where no sequences were reoriented (i.e. the output was 0)
    grep -Fq $file1 tempdir2/seq_count_after.temp
    if [[ $? != 0 ]]; then
        printf "$file1\t$count1\t0\n" >> $output_dir/$subdir/seq_count_summary.txt
    fi
done < tempdir2/seq_count_before.txt && rm -rf tempdir2

#Note for counting seqs in FASTQ files
if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    printf "\nPlease note that sequence count assumes that there are 4 lines per sequence in a FASTQ file (as this is mostly the case).
You may double-check the sequence count of one file using implemented 'FastQC' program in PipeCraft.\n" >> $output_dir/$subdir/seq_count_summary.txt
fi

#Delete decompressed files if original set of files were compressed
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    rm *.$newextension
fi
#Remove mothur logfiles
mothur_logfiles=$(ls -1 *.logfile 2>/dev/null | wc -l)
if [ $mothur_logfiles != 0 ]; then 
    rm mothur.*.logfile 
fi
#Delete tempdir
if [ -d tempdir ]; then
    rm -rf tempdir
fi
}

###########################################################
### Paired-end data reorient reads based on FWD primers ###
###########################################################
function PE_reorient_FWD () {
touch tempdir/R1.5_3.fastq
touch tempdir/R2.5_3.fastq
### Reorient based on FWD primer(s)
for primer in $(echo $fwd_tempprimer | sed "s/,/ /g"); do
    printf '%s\n' " searching FWD primer $primer"
    #convert IUPAC codes in fwd primer
    fwd_primer=$(convert_IUPAC $primer)
    #seach fwd primer in R1 and write to file
    fqgrep -m $mismatches -p $fwd_primer -e $inputR1.$newextension >> tempdir/R1.5_3.fastq
    #seach fwd primer in R2 and write to file
    fqgrep -m $mismatches -p $fwd_primer -e $inputR2.$newextension >> tempdir/R2.5_3.fastq
done
}

###########################################################
### Paired-end data reorient reads based on REV primers ###
###########################################################
function PE_reorient_REV () {
touch tempdir/R1.3_5.fastq
touch tempdir/R2.3_5.fastq
### Reorient based on REV primer(s)
for primer in $(echo $rev_tempprimer | sed "s/,/ /g"); do
    #convert IUPAC codes in rev primer
    rev_primer=$(convert_IUPAC $primer)
    printf '%s\n' " searching REV primer $primer"
    #search rev primer in R1 and write to file
    fqgrep -m $mismatches -p $rev_primer -e $inputR1.$newextension >> tempdir/R1.3_5.fastq
    #search rev primer in R2 and write to file
    fqgrep -m $mismatches -p $rev_primer -e $inputR2.$newextension >> tempdir/R2.3_5.fastq
done
}

#######################################################
### Single-End data reorient reads based on primers ###
#######################################################
#Fwd primers
function SE_reorient_FWD () {
touch tempdir/5_3.fastx
### Reorient based on FWD primer(s)
for primer in $(echo $fwd_tempprimer | sed "s/,/ /g"); do
	printf '%s\n' " searching FWD primer $primer"
	#convert IUPAC codes in fwd primer
	fwd_primer=$(convert_IUPAC $primer)
	#seach fwd primer and write to file
	if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
	    fqgrep -m $mismatches -p $fwd_primer -e $input.$newextension >> tempdir/5_3.fastx
    elif [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]]; then
    	fqgrep -m $mismatches -p $fwd_primer -f -e $input.$newextension >> tempdir/5_3.fastx
    else
	    printf '%s\n' "ERROR]: $file formatting not supported!
Supported extensions: fastq, fq, fasta, fa, fas (and gz or zip compressed formats).
>Quitting" >&2
		end_process
    fi
done
}
#Rev primers
function SE_reorient_REV () {
touch tempdir/3_5.fastx
### Reorient based on REV primer(s)
for primer in $(echo $rev_tempprimer | sed "s/,/ /g"); do
    #convert IUPAC codes in rev primer
    rev_primer=$(convert_IUPAC $primer)
    printf '%s\n' " searching REV primer $primer"
    #search rev primer and write to file
    if [[ $newextension == "fastq" ]] || [[ $newextension == "fq" ]]; then
    	fqgrep -m $mismatches -p $rev_primer -e $input.$newextension >> tempdir/3_5.fastx
    elif [[ $newextension == "fasta" ]] || [[ $newextension == "fa" ]] || [[ $newextension == "fas" ]]; then
    	fqgrep -m $mismatches -p $rev_primer -f -e $input.$newextension >> tempdir/3_5.fastx
    else
	    printf '%s\n' "ERROR]: $file formatting not supported!
Supported extensions: fastq, fq, fasta, fa, fas (and gz or zip compressed formats).
>Quitting" >&2
		end_process
    fi
done
}

################################
### Multiprimer artefacts R1 ###
################################
# R1 multi-primer artefacts search
function multiprimer_search_R1 () {
checkerror=$(seqkit rmdup --quiet -n -D tempdir/duplicatesR1.temp tempdir/R1.5_3.fastq > tempdir/R1.5_3.fastq.temp 2>&1)
check_app_error
if [ -s tempdir/duplicatesR1.temp ]; then
    awk 'BEGIN{FS=","}{print $2}' tempdir/duplicatesR1.temp | sed -e 's/^ //' > tempdir/duplicatesR1.names
        #Remove duplicate seqs from fastq
    checkerror=$(seqkit grep --invert-match -n -f tempdir/duplicatesR1.names tempdir/R1.5_3.fastq.temp \
    -o tempdir/$inputR1.reoriented.$newextension 2>&1)
    check_app_error
        #Get multi-primer artefacts
    checkerror=$(seqkit grep -f tempdir/duplicatesR1.names tempdir/R1.5_3.fastq.temp -o tempdir/$inputR1.multiprimer.$newextension 2>&1)
    check_app_error
    multiprimer_count=$(wc -l tempdir/duplicatesR1.names | awk '{print $1}')
    printf "   - found $multiprimer_count 'multi-primer' chimeric sequence(s) from $inputR1.$newextension \n"
else
    mv tempdir/R1.5_3.fastq.temp tempdir/$inputR1.reoriented.$newextension
    printf "   - no 'multi-primer' chimeric sequences found from $inputR1.$newextension \n"
fi
}

# R2 multi-primer artefacts search
function multiprimer_search_R2 () {
checkerror=$(seqkit rmdup --quiet -n -D tempdir/duplicatesR2.temp tempdir/R2.3_5.fastq > tempdir/R2.3_5.fastq.temp 2>&1)
check_app_error
if [ -s tempdir/duplicatesR2.temp ]; then
    awk 'BEGIN{FS=","}{print $2}' tempdir/duplicatesR2.temp | sed -e 's/^ //' > tempdir/duplicatesR2.names
        #Remove duplicate seqs from fastq
    checkerror=$(seqkit grep --invert-match -n -f tempdir/duplicatesR2.names tempdir/R2.3_5.fastq.temp \
    -o tempdir/$inputR2.reoriented.$newextension 2>&1)
    check_app_error
        #Get multi-primer artefacts
    checkerror=$(seqkit grep -f tempdir/duplicatesR2.names tempdir/R2.3_5.fastq.temp -o tempdir/$inputR2.multiprimer.$newextension 2>&1)
    check_app_error

    multiprimer_count=$(wc -l tempdir/duplicatesR2.names | awk '{print $1}')
    printf "   - found $multiprimer_count 'multi-primer' chimeric sequence(s) from $inputR2.$newextension \n"
else
    mv tempdir/R2.3_5.fastq.temp tempdir/$inputR2.reoriented.$newextension
    printf "   - no 'multi-primer' chimeric sequences found from $inputR2.$newextension \n"
fi
}

# Single-end data multi-primer artefacts search
function multiprimer_search_SE () {
checkerror=$(seqkit rmdup --quiet -n -D tempdir/duplicates.temp tempdir/5_3.fastx > tempdir/5_3.fastx.temp 2>&1)
check_app_error
if [ -s tempdir/duplicates.temp ]; then
    awk 'BEGIN{FS=","}{print $2}' tempdir/duplicates.temp | sed -e 's/^ //' > tempdir/duplicates.names
        #Remove duplicate seqs from fastx
    checkerror=$(seqkit grep --invert-match -n -f tempdir/duplicates.names tempdir/5_3.fastx.temp \
    -o tempdir/$input.reoriented.$newextension 2>&1)
    check_app_error

        #Get multi-primer artefacts
    checkerror=$(seqkit grep -f tempdir/duplicates.names tempdir/5_3.fastx.temp \
    -o tempdir/$input.multiprimer.$newextension 2>&1)
    check_app_error

    multiprimer_count=$(wc -l tempdir/duplicates.names | awk '{print $1}')
    printf "   - found $multiprimer_count 'multi-primer' chimeric sequence(s) from $input.$newextension \n"
else
    mv tempdir/5_3.fastx.temp tempdir/$input.reoriented.$newextension
    printf "   - no 'multi-primer' chimeric sequences found from $input.$newextension \n"
fi
}


###########################
### Check barcodes file ###
###########################
### Check barcodes file
function check_indexes_file () {
printf "\nValidating barcodes file ...\n"
    #is fasta format?
cat $indexes_file | seqkit seq -v > tempdir2/ValidatedBarcodesFileForDemux.fasta.temp
if [ "$?" != "0" ]; then
    printf '%s\n' "ERROR]: 'indexes file' not in correct fasta format. 
Please check the indexes file and format according to the 'indexes_file_example.txt'
>Quitting" >&2
    end_process
fi
    #does not contain duplicate values?
sort tempdir2/ValidatedBarcodesFileForDemux.fasta.temp | \
uniq --count --repeated | \
grep . && printf '%s\n' "ERROR]: indexes or samples names (above) are not unique in the indexes file. 
Please check the indexes file and include only unique index combinations and sample names.
>Quitting" >&2 && end_process \
|| :
    # report if dual indexes or single indexes
if grep -q "\..." tempdir2/ValidatedBarcodesFileForDemux.fasta.temp; then
    echo "ok; dual indexes"
else
    echo "ok; single indexes"
fi
}

