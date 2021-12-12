#!/bin/bash

# Sequence clustering with vsearch
#Input = single-end fasta/fastq files.
#Output = FASTA formated representative OTU sequences and OTU_table.txt.

##########################################################
###Third-party applications:
#vsearch v2.18.0
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#GNU Parallel 20210422
    #Citation: Tange, O. (2021, April 22). GNU Parallel 20210422 ('Ever Given'). Zenodo. https://doi.org/10.5281/zenodo.4710607
    #Copyright (C) 2007-2021 Ole Tange, http://ole.tange.dk and Free Software Foundation, Inc.
    #Distributed under the License GPLv3+
#pigz v2.4
##########################################################

#load variables
extension=$fileFormat
#mandatory options
id=$"--id ${similarity_threshold}" # positive float (0-1)
otutype=$"--${OTU_type}" # list: --centroids, --consout
strands=$"--strand ${strands}" # list: --strand both, --strand plus
minsize=$"--minsize ${min_OTU_size}" # pos int

#additional options
seqsort=$"--${sequence_sorting}" # list: --cluster_size or --cluster_fast, --cluster_smallmem
simtype=$"--iddef ${similarity_type}" # list: --iddef 0; --iddef 1; --iddef 2; --iddef 3; --iddef 4
centroid=$centroid_type # list: similarity, abundance
maxaccepts=$"--maxaccepts ${max_hits}" # pos int
relabel=$relabel # list: none, sha1, md5
mask=$"--qmask ${mask}" # list: --qmask dust, --qmask none
dbmask=$"--dbmask ${dbmask}"  # list: --qmask dust, --qmask none
uc=$output_UC # false or true
###############################
# Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/clustering_out"

#additional options, if selection != undefined/false
if [[ $centroid == "similarity" ]]; then
    centroid_in=$"" 
else
    centroid_in=$"--sizeorder"
fi
if [[ $relabel == "none" ]]; then
    relabel_in=$"" 
elif [[ $relabel == "sha1" ]]; then
    relabel_in=$"--relabel_sha1"
elif [[ $relabel == "md5" ]]; then
    relabel_in=$"--relabel_md5"
fi
if [[ $uc == "false" ]]; then
    uc_in=$""
else
    uc_in=$"--uc $output_dir/OTUs.uc"
fi

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check_clustering
### Prepare working env and check paired-end data
prepare_SE_env

### Pre-process samples
printf "Checking files ...\n"
for file in *.$extension; do
    #Read file name; without extension
    input=$(echo $file | sed -e "s/.$extension//")
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_SE
    ### Check input formats (fastq/fasta supported)
    check_extension_fastx
done

### Global dereplication
find . -maxdepth 1 -name "*.$newextension"

find . -maxdepth 1 -name "*.$newextension" | parallel -j 1 "cat {}" \
| vsearch \
--derep_fulllength - \
--output - \
--fasta_width 0 \
--threads 1 \
--sizein --sizeout > $output_dir/Glob_derep.fasta

### Clustering
checkerror=$(vsearch $seqsort \
$output_dir/Glob_derep.fasta \
$id \
$simtype \
$strands \
$relabel_in \
$mask \
$centroid_in \
$maxaccepts \
$cores \
$otutype \
$output_dir/OTUs.temp.fasta \
$uc_in \
--fasta_width 0 \
--sizein --sizeout 2>&1)
check_app_error

### Discard OTUs with less than specified number of sequence (minsize)
if [[ $minsize != "--minsize 1"  ]]; then
    checkerror=$(vsearch \
    --sortbysize $output_dir/OTUs.temp.fasta \
    $minsize \
    --sizein --sizeout --fasta_width 0 \
    --output $output_dir/OTUs.fasta 2>&1)
    check_app_error
    rm $output_dir/OTUs.temp.fasta
else
    mv $output_dir/OTUs.temp.fasta $output_dir/OTUs.fasta
fi

### Dereplication of individual samples, add sample ID to the header
mkdir -p tempdir

derep_rename () {
  samp_name=$(basename $1 | awk 'BEGIN{FS="."} {$NF=""; print $0}' | sed 's/ //g')

  vsearch \
    --derep_fulllength "$1" \
    --output - \
    --fasta_width 0 \
    --threads 1 \
    --sizein --sizeout \
  | sed 's/>.*/&;sample='"$samp_name"'/' > tempdir/"$samp_name".fasta
}
export -f derep_rename

find . -maxdepth 1 -name "*.$newextension" | parallel -j 1 "derep_rename {}"

cat tempdir/*.fasta > tempdir/Dereplicated_samples.fasta

### OTU table creation
checkerror=$(vsearch \
--usearch_global tempdir/Dereplicated_samples.fasta \
--db $output_dir/OTUs.fasta \
$id \
$strands \
$mask \
$dbmask \
--sizein --sizeout \
$cores \
--otutabout $output_dir/OTU_table.txt  2>&1)
check_app_error

#Order the OTUs in fasta file accoring to OTU table
if [[ -s "$output_dir/OTU_table.txt" ]]; then 
    awk 'BEGIN{FS="\t"}{print $1}' < $output_dir/OTU_table.txt > $output_dir/OTUs.names
    touch $output_dir/ordered.OTUs.fasta
    while read ID; do
        grep -A1 ">$ID" $output_dir/OTUs.fasta >> $output_dir/ordered.OTUs.fasta
    done < $output_dir/OTUs.names
    #remove and rename
    rm $output_dir/OTUs.names
    rm $output_dir/OTUs.fasta
    mv $output_dir/ordered.OTUs.fasta $output_dir/OTUs.fasta
fi

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
rm $output_dir/Glob_derep.fasta
#Delete decompressed files if original set of files were compressed
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    rm *.$newextension
fi

#Delete tempdirs
if [ -d tempdir ]; then
    rm -rf tempdir
fi
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi
size=$(grep -c "^>" $output_dir/OTUs.fasta)

#Make README.txt file
printf "Clustering formed $size OTUs;
'clustering_out' directory contains FASTA formated representative OTU sequences (OTUs.fasta)
and an OTU distribution table per sample (per input file in the working directory), OTU_table.txt.\n
Total run time was $runtime sec.\n\n\n
##################################################################
###Third-party applications for this process [PLEASE CITE]:
#vsearch v2.18.0 for clustering
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#GNU Parallel 20210422 for job parallelisation 
    #Citation: Tange, O. (2021, April 22). GNU Parallel 20210422 ('Ever Given'). Zenodo. https://doi.org/10.5281/zenodo.4710607
    #Copyright (C) 2007-2021 Ole Tange, http://ole.tange.dk and Free Software Foundation, Inc.
    #Distributed under the License GPLv3+
##########################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Check README.txt files in output directory for further information about the process.\n"

end=$(date +%s)
runtime=$((end-start))
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
