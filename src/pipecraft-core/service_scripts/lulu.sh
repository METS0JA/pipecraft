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
#Source for functions
source /scripts/framework.functions.sh

#specify input table and OTUs/ASVs fasta file
# regex='[^/]*$'
# otu_table_temp=$(echo $table | grep -oP "$regex")
# otu_table=$(printf "/extraFiles/$otu_table_temp")

otu_table=$"otutable_test.txt"
echo "table = $otu_table"

# Duplicate mount point ERROR -> read fasta file inside the folder, specify only the OTU table?
# input_fasta_temp=$(echo $rep_seqs | grep -oP "$regex")
# input_fasta=$(printf "/extraFiles/$input_fasta_temp")
# echo "rep seqs = $input_fasta"
extension=$fileFormat
i=$"0"
for file in *.$extension; do
    input_fasta=$(echo $file)
    i=$((i + 1))
done
# if [[ $i > 1 ]]; then
#     printf '%s\n' "ERROR]: more than one representative sequence file ($extension) in the working folder" >&2
#     end_process
# else
#     printf "\n input fasta = $input_fasta \n\n"
# fi

printf "\n input fasta = $input_fasta \n\n"

#variables for match list
match_list_soft=${match_list_soft}
vsearch_similarity_type=${vsearch_similarity_type}
match_list_id=${match_list_id}
match_list_cov=${match_list_cov}
strands=${strands}
cores=${cores}


### Check if files with specified extension exist in the dir
# first_file_check

### Generate match list for LULU
if [[ match_list_soft == "blastn" ]]; then
    printf "\n#Making blast database from the input fasta\n"
    makeblastdb -in $input_fasta -parse_seqids -dbtype nucl

    printf "#Generating match list for lulu using BLASTn"
    blastn -db $input_fasta \
            -outfmt '6 qseqid sseqid pident' \
            -out match_list.lulu \
            -qcov_hsp_perc $qcov_hsp_perc \
            -perc_identity $perc_identity \
            -query $input_fasta \
            -num_threads $cores
fi

if [[ match_list_soft == "vsearch" ]]; then
    printf "#Generating match list for lulu using vsearch"
    vsearch_perc_identity=$(awk "BEGIN {print $perc_identity/100}")
    vsearch_qcov_hsp_perc=$(awk "BEGIN {print $qcov_hsp_perc/100}")

    vsearch --usearch_global $input_fasta \
            --db $input_fasta \
            --strand both --self \
            --id $vsearch_perc_identity \
            --iddef $iddef \
            --userout match_list.lulu \
            --userfields query+target+id \
            --maxaccepts 0 \
            --query_cov $vsearch_qcov_hsp_perc \
            --threads $cores
fi


# LULU supposed to run in R script below... 

# #Run LULU in R
# printf "Running lulu\n"
# ./lulu.R
# wait

# #remove db files
# rm $input_fasta.n*
# rm lulu.log_*
