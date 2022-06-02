#!/bin/bash


## TO fix: output smaple names! And new OTUs.fasta file, when some are discarded


#Post-clustering of OTU/ASV table with LULU 

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
#(variables used in lulu.R)
min_ratio_type=${min_ratio_type}
min_ratio=${min_ratio}
min_match=${min_match}
min_rel_cooccurence=${min_rel_cooccurence}

#Source for functions
source /scripts/framework.functions.sh
#output dir
output_dir=$"/input/lulu_out"

#Automatic search for OTU_table.txt or ASVs_table.txt (standard PipeCraft2 output file names), otherwise use the file that was specified in the panel
if [[ -f "OTU_table.txt" ]]; then
    otu_table=$"OTU_table.txt"
elif [[ -f "ASVs_table.txt" ]]; then
    otu_table=$"ASVs_table.txt"
elif [[ $table == "undefined" ]]; then
    printf '%s\n' "ERROR]: input table was not specified and cannot find OTU_table.txt or ASVs_table.txt in the working dir.\n >Quitting" >&2
    end_process
else
    #get input OTU table file
    regex='[^/]*$'
    otu_table_temp=$(echo $table | grep -oP "$regex")
    otu_table=$(printf "/extraFiles/$otu_table_temp")
fi

#start time
start=$(date +%s)

### Check if files with specified extension exist in the dir
first_file_check
### Check if single-end files are compressed (decompress and check)
check_gz_zip_SE

### Get input rep seqs (OTUs.fasta) and give ERROR when multiple rep seqs files are in the working folder
i=$"0"
for file in *.$newextension; do
    echo $file
    input_fasta=$(echo $file)
    i=$((i + 1))
done
if [[ $i > 1 ]]; then
    printf '%s\n' "ERROR]: more than one representative sequence file ($newextension file) in the working folder" >&2
    end_process
else
    printf "\n input fasta = $input_fasta \n\n"
fi



#############################
### Start of the workflow ###
#############################
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

###Run LULU in R
printf "# Running lulu\n"
errormessage=$(Rscript /scripts/lulu.R 2>&1)
echo $errormessage > $output_dir/R_run.txt
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

end=$(date +%s)
runtime=$((end-start))

###Make README.txt file
#match_list generation
if [[ $match_list_soft == "blastn" ]]; then
    match_list_generation=$"makeblastdb -in $input_fasta -parse_seqids -dbtype nucl; blastn -db $input_fasta -outfmt '6 qseqid sseqid pident' -out $output_dir/match_list.lulu -qcov_hsp_perc $coverage_perc -perc_identity $perc_identity -query $input_fasta -num_threads $cores"
fi
if [[ $match_list_soft == "vsearch" ]]; then
    match_list_generation=$"vsearch --usearch_global $input_fasta --db $input_fasta --strand both --self --id $vsearch_perc_identity --iddef $vsearch_similarity_type --userout $output_dir/match_list.lulu --userfields query+target+id --maxaccepts 0 --query_cov $vsearch_coverage_perc --threads $cores"
fi

printf "Files in 'lulu_out' directory represent chimera filtered sequences.
Files in 'lulu_out/chimeras' directory represent identified putative chimeric sequences.

Core commands -> 
match list for LULU: (match_list.lulu) $match_list_generation
LULU in R: curated_result <- lulu::lulu(otutable_name, match_list.lulu, minimum_ratio_type = min_ratio_type, minimum_ratio = min_ratio, minimum_match = min_match, minimum_relative_cooccurence = min_rel_cooccurence

Total run time was $runtime sec.\n\n" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
