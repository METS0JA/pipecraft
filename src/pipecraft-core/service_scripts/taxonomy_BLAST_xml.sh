#!/bin/bash

#Input = single-end fasta file.
#Outputs: BLAST_1st_best_hit.txt, BLAST_10_best_hits.txt

# Taxonomy annotation with BLAST
#If database = fasta file, then makeblastdb with BLAST+, otherwise run BLAST

##########################################################
###Third-party applications:
    #BLAST 2.11.0+
    #citation: Camacho C., Coulouris G., Avagyan V., Ma N., Papadopoulos J., Bealer K., & Madden T.L. (2008) "BLAST+: architecture and applications." BMC Bioinformatics 10:421. 
#python3 with biopython module
##########################################################

###############################
###############################
#These variables are for testing (DELETE when implementing to PipeCraft)
extension=$"fasta"

#input OTUs/ASVs
if [[ -f "$workingDir/OTUs.fasta" ]]; then
    IN=$"$workingDir/OTUs.fasta"
fi
if [[ -f "$workingDir/ASVs.fasta" ]]; then
    IN=$"$workingDir/ASVs.fasta"
fi

#database [# here, a possibility for multiple databases to be added: database=$"-db $db1 $db2 $db3 $db4 $db5"]
regex='[^\\]*$'
db1_temp=$(echo $database_file | grep -oP "$regex")
db1=$(printf "/extraFiles/$db1_temp")

#mandatory options
task=$"-task ${task}"          # list: blastn, megablast
strand=$"-strand ${strand}"        #list: both, plus
database=$"-db $db1" # here, a possibility for multiple databases to be added: database=$"-db $db1 $db2 $db3 $db4 $db5"

#additional options
cores=$"-num_threads 8" # positive integer
evalue=$"-evalue=${e_value}" # float
wordsize=$"-word_size=${word_size}" # positive integer
reward=$"-reward=${reward}" # positive integer
penalty=$"-penalty=${penalty}" # negative integer
gapopen=$"-gapopen=${gap_open}" # positive integer
gapextend=$"-gapextend=${gap_extend}" # positive integer
###############################

#############################
### Start of the workflow ###
#############################
start=$(date +%s)
# Source for functions
source /scripts/framework.functions.sh
parseXML=$"/scripts/Blast_xml_parse.py"

#output dir
output_dir=$"/input/taxonomy_out"

### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check paired-end data
prepare_SE_env
#If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
	#$extension will be $newextension
check_gz_zip_SE
### Check input formats (fasta supported)
check_extension_fasta


### Check BLAST database
d1=$(echo $db1 | awk 'BEGIN{FS=OFS="."}{print $NF}')
#make blast database if db is not formatted for BLAST
db_dir=$(dirname $db1)
check_db_presence=$(ls -1 $db_dir/*.nhr 2>/dev/null | wc -l)
if [[ $check_db_presence != 0 ]];then
	:
elif [[ $d1 == "fasta" ]] || [[ $d1 == "fa" ]] || [[ $d1 == "fas" ]] || [[ $d1 == "fna" ]] || [[ $d1 == "ffn" ]]; then
	printf '%s\n' "Note: converting fasta formatted database for BLAST"
	makeblastdb -in $db1 -input_type fasta -dbtype nucl
else
	#if database is already formatted, then remove last extention
	db1=$(echo $db1 | awk 'BEGIN{FS=OFS="."}NF{NF-=1};1')
fi


## Perform taxonomy annotation
printf '%s\n' "Running BLAST"
checkerror=$(blastn \
-query $IN \
$strands \
$cores \
$database \
-out $output_dir/10BestHits.xml \
$task \
-max_target_seqs 10 \
$evalue \
$wordsize \
$reward \
$penalty \
$gapopen \
$gapextend \
-max_hsps 1 \
-outfmt=5 2>&1)
check_app_error

### Parse BLAST xml file
python3 $parseXML $output_dir/10BestHits.xml

#Extract first best hit from 10 best hits file
gawk 'BEGIN{FS=OFS="\t"}{print $1,$4}' < 10hits.txt | \
sed -e 's/^$/NO_BLAST_HIT/g' | \
sed '1 i\SeqID+first_hit+score+e-value+query len+query start+query end+target len+target start+target end+align len+identities+gaps+coverage%+id%' \
> $output_dir/BLAST_1st_best_hit.txt

#Format 10 best hits from 10 best hits file
gawk 'BEGIN{FS=OFS="\t"}{print $1,$4,$6,$7,$9,$10,$12,$13,$15,$16,$18,$19,$21,$22,$24,$25,$27,$28,$30,$31}' < 10hits.txt | \
sed '1 i\SeqID+first_hit+score+e-value+query len+query start+query end+target len+target start+target end+align len+identities+gaps+coverage%+id%+next_hits' \
> $output_dir/BLAST_10_best_hits.txt


#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
rm 10hits.txt
rm $output_dir/10BestHits.xml
if [[ -d tempdir2 ]];then
	rm -r tempdir2
fi
#Make README.txt file
printf "Taxonomy annotation was done with BLAST.
Input = $IN
BLAST_1st_best_hit.txt contains BLAST results for the 1st best hit in the used database(s).
BLAST_10_best_hits.txt contains BLAST results for the 10 best hits in the used database(s).\n
score -> blast score
e-value -> blast e-value
query len -> query (i.e. OTU/ASV) sequence length
query start -> start position of match in the query seq
query end -> end position of match in the query seq
target len -> target seq length in the database
target start -> start position of match in the target seq
target end -> end position of match in the target seq
align len -> alignment length of query and target
identities -> number of identical matches
gaps -> number of gaps in the alignment
coverage -> query coverage percentage against the target sequence (100 percent is full-length match; low coverage may indicate presence of chimeric sequence/OTU)
id -> identity percentage against the target sequence.\n" > $output_dir/README.txt

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
echo "readType=single-end"
