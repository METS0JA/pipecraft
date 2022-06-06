#!/bin/bash

#Post-clustering of OTU/ASV table with LULU 
#Input = specified table (if not specified, then OTU_table.txt or ASVs_table.txt will be searched from the workingDir)
#Representative sequeces are searched from the workingDir as based on the specified file extension

##########################################################
###Third-party applications:
#lulu v0.1.0
    #citation: Froslev, T.G., Kjoller, R., Bruun, H.H. et al. (2017) Algorithm for post-clustering curation of DNA amplicon data yields reliable biodiversity estimates. Nat Commun 8, 1188.
    #Distributed under the GNU LESSER GENERAL PUBLIC LICENSE
    #https://github.com/tobiasgf/lulu
#BLAST 2.11.0+
    #citation: Camacho C., Coulouris G., Avagyan V., Ma N., Papadopoulos J., Bealer K., & Madden T.L. (2008) BLAST+: architecture and applications. BMC Bioinformatics 10:421. 
#vsearch v2.18.0
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#pigz
##################################################################

#env variables
workingDir=${workingDir}
extension=$fileFormat
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
if [[ -e "$workingDir/OTU_table.txt" ]]; then
    otu_table=$"$workingDir/OTU_table.txt"
    printf "\n input table = $otu_table \n"
elif [[ -e "$workingDir/ASVs_table.txt" ]]; then
    otu_table=$"$workingDir/ASVs_table.txt"
    printf "\n input table = $otu_table \n"
elif [[ $table == "undefined" ]]; then
    printf '%s\n' "ERROR]: input table was not specified and cannot find OTU_table.txt or ASVs_table.txt in the working dir.
    >Quitting" >&2
    end_process
else
    #get input OTU table file
    regex='[^/]*$'
    otu_table_temp=$(echo $table | grep -oP "$regex")
    otu_table=$(printf "/extraFiles/$otu_table_temp")
    printf "\n input table = $otu_table \n"
fi

#Automatic search for OTUs.fasta or ASVs.fasta (standard PipeCraft2 output file names), otherwise use the file that was specified in the panel
if [[ -e "$workingDir/OTUs.fasta" ]]; then
    input_fasta=$"$workingDir/OTUs.fasta"
    printf "\n input table = $input_fasta \n"
elif [[ -e "$workingDir/ASVs.fasta" ]]; then
    input_fasta=$"$workingDir/ASVs.fasta"
    printf "\n input fasta = $input_fasta \n"
elif [[ $rep_seqs == "undefined" ]]; then
    printf '%s\n' "ERROR]: rep seqs (input fasta) was not specified and cannot find OTUs.fasta or ASVs.fasta in the working dir.
    >Quitting" >&2
    end_process
else
    #get input fasta file
    regex='[^/]*$'
    input_fasta_temp=$(echo $rep_seqs | grep -oP "$regex")
    input_fasta=$(printf "/extraFiles2/$input_fasta_temp")
    printf "\n input fasta = $input_fasta \n"
fi

#############################
### Start of the workflow ###
#############################
#start time
start=$(date +%s)
### Generate match list for LULU
if [[ $match_list_soft == "BLAST" ]]; then
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

#Check if match list was generated
if [[ -e "$output_dir/match_list.lulu" ]]; then
    printf '%s\n' "match list generation with $match_list_soft done"
else
    printf '%s\n' "ERROR]: match list generation with $match_list_soft for LULU failed" >&2
    end_process
fi

#copy OTU table to $output_dir for lulu
cp $otu_table $output_dir/OTU_tab_for_lulu.txt

###Run LULU in R
printf "# Running lulu\n"
errormessage=$(Rscript /scripts/submodules/lulu.R 2>&1)
echo $errormessage > $output_dir/R_run.log 
wait
printf "\n LULU completed \n"

# Generate new OTUs.fasta file that excluded "discarded" OTUs by lulu
checkerror=$(seqkit grep --quiet \
                         --line-width 0 \
                         -f $output_dir/lulu_out_OTUids.txt \
                         $input_fasta > $output_dir/lulu_out_RepSeqs.fasta 2>&1)
check_app_error

########################################
### CLEAN UP AND COMPILE README FILE ###
########################################
for i in $input_fasta.n*; do
    [[ -f $i ]] || continue
    rm -f "$i"
done
if [[ -f $output_dir/R_run.log ]]; then
    rm -f $output_dir/R_run.log
fi
if [[ -f $output_dir/lulu_out_OTUids.txt ]]; then
    rm -f $output_dir/lulu_out_OTUids.txt
fi

end=$(date +%s)
runtime=$((end-start))

###Make README.txt file
#match_list generation
if [[ $match_list_soft == "BLAST" ]]; then
    match_list_generation=$"makeblastdb -in $input_fasta -parse_seqids -dbtype nucl; blastn -db $input_fasta -outfmt '6 qseqid sseqid pident' -out $output_dir/match_list.lulu -qcov_hsp_perc $coverage_perc -perc_identity $perc_identity -query $input_fasta -num_threads $cores"
fi
if [[ $match_list_soft == "vsearch" ]]; then
    match_list_generation=$"vsearch --usearch_global $input_fasta --db $input_fasta --strand both --self --id $vsearch_perc_identity --iddef $vsearch_similarity_type --userout $output_dir/match_list.lulu --userfields query+target+id --maxaccepts 0 --query_cov $vsearch_coverage_perc --threads $cores"
fi
#count merged units and curated units
merged_units=$(wc -l $output_dir/discarded_units.lulu | awk '{print $1}')
curated_units=$(grep -c "^>" $output_dir/lulu_out_RepSeqs.fasta)

printf "Total of $merged_units molecular units (OTUs or ASVs) were merged.
Curated table consists of $curated_units molecular units (OTUs or ASVs).

Files in 'lulu_out' directory:
# lulu_out_table.csv     = curated table in csv format
# lulu_out_table.txt     = curated table in tab delimited txt format
# lulu_out_RepSeqs.fasta = fasta file for the molecular units (OTUs or ASVs) in the curated table
# match_list.lulu        = match list file that was used by LULU to merge 'daughter molecular units'
# discarded_units.lulu   = molecular units (OTUs or ASVs) that were merged with other units based on specified thresholds)

Core commands -> 
match list for LULU (match_list.lulu): $match_list_generation
LULU in R: curated_result <- lulu::lulu(otutable_name, match_list.lulu, minimum_ratio_type = $min_ratio_type, minimum_ratio = $min_ratio, minimum_match = $min_match, minimum_relative_cooccurence = $min_rel_cooccurence)

Total run time was $runtime sec.

##########################################################
###Third-party applications [PLEASE CITE]:
#lulu v0.1.0
    #citation: Froslev, T.G., Kjoller, R., Bruun, H.H. et al. 2017. Algorithm for post-clustering curation of DNA amplicon data yields reliable biodiversity estimates. Nat Commun 8, 1188.
#BLAST 2.11.0+ (if BLAST was used to make match_list.lulu)
    #citation: Camacho C., Coulouris G., Avagyan V., Ma N., Papadopoulos J., Bealer K., & Madden T.L. (2008) BLAST+: architecture and applications. BMC Bioinformatics 10:421. 
#vsearch v2.18.0 (if vsearch was used to make match_list.lulu)
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
##################################################################" > $output_dir/README.txt

#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Check README.txt files in output directory for further information about the process.\n"
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=$output_dir"
echo "fileFormat=$extension"
echo "dataFormat=$dataFormat"
echo "readType=single_end"
