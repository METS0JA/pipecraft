#!/bin/bash

##### TESTING !!!


## TO fix: output smaple names! And new OTUs.fasta file, when some are discarded

#Post-clustering with LULU 

##########################################################
###Third-party applications:
#lulu v0.1.0
    #citation: 
    #Distributed under the GNU LESSER GENERAL PUBLIC LICENSE
    #https://github.com/tobiasgf/lulu
#BLAST 2.11.0+
    #citation: Camacho C., Coulouris G., Avagyan V., Ma N., Papadopoulos J., Bealer K., & Madden T.L. (2008) "BLAST+: architecture and applications." BMC Bioinformatics 10:421. 
#vsearch v2.18.0
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
##################################################################

#load variables
match_list_soft=${match_list_soft}
vsearch_similarity_type=${vsearch_similarity_type}
perc_identity=${perc_identity}
coverage_perc=${coverage_perc}
strands=${strands}
cores=${cores}

#specify input OTU table file
regex='[^/]*$'
otu_table_temp=$(echo $table | grep -oP "$regex")
otu_table=$(printf "/extraFiles/$otu_table_temp")

# otu_table=$"otutable_test.txt"
echo "table = $otu_table"
#input_fasta=$"centroids_test.fasta"
#printf "\n input fasta = $input_fasta \n\n"

# input_fasta_temp=$(echo $rep_seqs | grep -oP "$regex")
# input_fasta=$(printf "/extraFiles/$input_fasta_temp")
# echo "rep seqs = $input_fasta"

#Write that only fasta files are allowed, not fastq
extension=$fileFormat
i=$"0"
for file in *.$extension; do
    echo $file
    input_fasta=$(echo $file)
    i=$((i + 1))
done
if [[ $i > 1 ]]; then
    printf '%s\n' "ERROR]: more than one representative sequence file ($extension file) in the working folder" >&2
    end_process
else
    printf "\n input fasta = $input_fasta \n\n"
fi

#Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/lulu_out"

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env

### Generate match list for LULU
if [[ $match_list_soft == "blastn" ]]; then
    printf "\n#Making blast database from the input fasta \n"
    checkerror=$(makeblastdb -in $input_fasta -parse_seqids -dbtype nucl 2>&1)
    check_app_error

    printf "# Generating match list for lulu using BLASTn \n"
    checkerror=$(blastn -db $input_fasta \
            -outfmt '6 qseqid sseqid pident' \
            -out $output_dir/match_list.lulu \
            -qcov_hsp_perc $coverage_perc \
            -perc_identity $perc_identity \
            -query $input_fasta \
            -num_threads $cores 2>&1)
            check_app_error
fi

if [[ $match_list_soft == "vsearch" ]]; then
    printf "# Generating match list for lulu using vsearch \n"
    #convert perc_identity and coverage_perc for vsearch
    vsearch_perc_identity=$(awk "BEGIN {print $perc_identity/100}")
    vsearch_coverage_perc=$(awk "BEGIN {print $coverage_perc/100}")
    #run vsearch
    checkerror=$(vsearch --usearch_global $input_fasta \
            --db $input_fasta \
            --strand both --self \
            --id $vsearch_perc_identity \
            --iddef $vsearch_similarity_type \
            --userout $output_dir/match_list.lulu \
            --userfields query+target+id \
            --maxaccepts 0 \
            --query_cov $vsearch_coverage_perc \
            --threads $cores 2>&1)
            check_app_error
fi

#copy OTU table to $output_dir
cp $otu_table $output_dir/OTU_tab_for_lulu.txt

# #Run LULU in R

printf "# Running lulu\n"
errormessage=$(Rscript /scripts/lulu.R 2>&1)
echo $errormessage > $output_dir/R_run.txt

if [ $? -eq 0 ]; then
    echo "lulu run OK"
else
    echo "lulu run FAIL"
fi

wait

#Clean up
if [[ -s $input_fasta.n* ]]; then
    rm $input_fasta.n*
fi 
if [[ -s lulu.log_* ]]; then
    rm lulu.log_*
fi

#Delete tempdir
if [ -d tempdir2 ]; then
    rm -rf tempdir2
fi

#DONE 
#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
