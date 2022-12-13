#!/bin/bash

#Input = single-end fasta/fastq files.
#Output = FASTA formated zOTU sequences and zOTU_table.txt, and optionally OTU sequences and OTU_table.txt

# Sequence denoising and clustering

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
#pigz
##########################################################

###############################
###############################
#load variables
extension=$fileFormat

#mandatory options
id=$"--id ${similarity_threshold}"              # positive float (0-1)  # OTU clustering if id < 1
zid=$"--id ${zOTUs_similarity_threshold}"       # positive float (0-1)  # for zOTU table
strands=$"--strand ${strands}"                  # both/plus
minsize=$"--minsize ${minsize}"                 # positive integer (default, 8)

#additional options
unoise_alpha=$"--unoise_alpha ${unoise_alpha}"  # positive integer (default, 2)
denoise_level=${denoise_level}                  # list: "global" or "individual"
chimerarm=${remove_chimeras}                    # TRUE or undefined
cores=$"--threads ${cores}"                     # positive integer
abskew=$"--abskew ${abskew}"                    # positive integer (default, 16)
simtype=$"--iddef ${similarity_type}"           # list: --iddef 0; --iddef 1; --iddef 2; --iddef 3; --iddef 4
maxaccepts=$"--maxaccepts ${maxaccepts}"        # positive integer (default, 1)
maxrejects=$"--maxrejects ${maxrejects}"        # positive integer (default, 32)
relabel=${relabel}                              # list: none, sha1, md5
mask=$"--qmask ${mask}"                         # list: --qmask dust, --qmask none
dbmask=$"--dbmask ${dbmask}"                    # list: --qmask dust, --qmask none
###############################
###############################

#############################
### Start of the workflow ###
#############################
#output dir
output_dir=$"/input/clustering_out"

## Number of cores for GNU parallel
NCORES=$cores
#NCORES=${cores/--threads /}

start=$(date +%s)
# Source for functions
source /scripts/submodules/framework.functions.sh

### Check if files with specified extension exist in the dir
first_file_check
### Prepare working env and check single-end data
prepare_SE_env

### Pre-process samples
printf "Checking files ...\n"
for file in *.$extension; do
    #Read file name; without extension
    input=$(echo $file | sed -e "s/.$extension//")
    #If input is compressed, then decompress (keeping the compressed file, but overwriting if filename exists!)
        #$extension will be $newextension
    check_gz_zip_SE
    ### Check input formats (fastq and fasta supported)
    check_extension_fastx
done

mkdir -p "$output_dir"
mkdir -p tempdir

## Dereplication of individual samples, add sample ID to the header
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

find . -maxdepth 1 -name "*.$newextension" | parallel -j "$NCORES" "derep_rename {}"

cat tempdir/*.fasta > $output_dir/Dereplicated_samples.fasta


## Denoizing sequences globally
if [[ $denoise_level == "global" ]]; then

  ### Global dereplication
  find . -maxdepth 1 -name "*.$newextension" | parallel -j 1 "cat {}" \
  | vsearch \
  --derep_fulllength - \
  --output - \
  --fasta_width 0 \
  --threads 1 \
  --sizein --sizeout > $output_dir/Glob_derep.fasta
  
  ### Clustering
  printf "clustering\n"
  checkerror=$(vsearch \
  --cluster_unoise $output_dir/Glob_derep.fasta \
  $strands \
  $minsize \
  $unoise_alpha \
  $simtype \
  $qmask \
  $maxaccepts \
  $maxrejects \
  $cores \
  $relabel_in \
  --centroids $output_dir/zOTUs.fasta \
  --uc $output_dir/zOTUs.uc \
  --fasta_width 0 \
  --sizein --sizeout 2>&1)
  check_app_error
  
  ## Remove chimera
  printf "remove chimeras\n"

  if [[ $chimerarm == "TRUE" ]]; then
    checkerror=$(vsearch \
    --sortbysize $output_dir/zOTUs.fasta \
    --output - \
    | vsearch \
    --uchime3_denovo - \
    $abskew \
    --nonchimeras $output_dir/zOTUs_noChim.temp.fasta \
    --chimeras tempdir/UNOISE_Chimeras.fasta \
    2>&1)
    check_app_error
  
    ## Count number of chimeric sequences
    chimeras=$(grep -c "^>" tempdir/UNOISE_Chimeras.fasta)

    ## Replace zOTUs with chimera-filtered zOTUs
    rm $output_dir/zOTUs.fasta
    mv $output_dir/zOTUs_noChim.temp.fasta $output_dir/zOTUs.fasta
  fi

fi  # end of global denoising


## Denoizing sequences individually for each sample
if [[ $denoise_level == "individual" ]]; then

  mkdir -p tempdir_denoize
  mkdir -p tempdir_chimera

  ## Function to denoise and remove chimera for each sample individually 
  denoise_and_chim () {
    
    samp_name=$(basename $1)

    ## Denoise sample
    checkerror=$(
    vsearch \
    --cluster_unoise "$1" \
      $strands \
      $minsize \
      $unoise_alpha \
      $simtype \
      $qmask \
      $maxaccepts \
      $maxrejects \
      --threads 1 \
      --centroids tempdir_denoize/"$samp_name" \
      --fasta_width 0 \
      --sizein --sizeout \
      2>&1)
    check_app_error
    
    ## Remove chimera
    if [[ $chimerarm == "TRUE" ]]; then
      checkerror=$(
      vsearch \
        --sortbysize tempdir_denoize/"$samp_name" \
        --output - \
        | vsearch \
        --uchime3_denovo - \
        $abskew \
        --nonchimeras tempdir_chimera/NonChim_"$samp_name" \
        --chimeras tempdir_chimera/Chim_"$samp_name" \
        2>&1)
      check_app_error
    fi
  }

  export -f denoise_and_chim
  export -f check_app_error
  export -f end_process

  export chimerarm="$chimerarm"
  export strands="$strands"
  export minsize="$minsize"
  export unoise_alpha="$unoise_alpha"
  export simtype="$simtype"
  export qmask="$qmask"
  export maxaccepts="$maxaccepts"
  export maxrejects="$maxrejects"

  ## Take dereplicated samples and apply denoising function
  find tempdir -maxdepth 1 -name "*.fasta" | parallel -j "$NCORES" "denoise_and_chim {}"

  if [[ $chimerarm == "TRUE" ]]; then
    ## Count chimeric sequences
    find tempdir_chimera -maxdepth 1 -name "Chim_*.fasta" | parallel -j 1 \
      "cat {} >> tempdir/All_chimera.fasta"
      
    chimeras=$(grep -c "^>" tempdir/All_chimera.fasta)

    ## Combine and dereplicate denoised sequences
    find tempdir_chimera -maxdepth 1 -name "NonChim_*.fasta" | parallel -j 1 "cat {}" \
    | vsearch \
    --derep_fulllength - \
    --output $output_dir/zOTUs.fasta \
    --fasta_width 0 \
    --threads 1 \
    --sizein --sizeout
  
  else
    ## Combine and dereplicate denoised sequences (without chimera removal step)
    find tempdir_denoize -maxdepth 1 -name "*.fasta" | parallel -j 1 "cat {}" \
    | vsearch \
    --derep_fulllength - \
    --output $output_dir/zOTUs.fasta \
    --fasta_width 0 \
    --threads 1 \
    $relabel_in \
    --sizein --sizeout
  fi
  

fi # end of individual denoising

## zOTU table creation
checkerror=$(vsearch \
--usearch_global $output_dir/Dereplicated_samples.fasta \
--db $output_dir/zOTUs.fasta \
$zid \
$strands \
$qmask \
$dbmask \
--sizein --sizeout \
$cores \
--otutabout $output_dir/zOTU_table.txt 2>&1)
check_app_error


## Perform OTU clustering (if required, id < 1)
if (( $(echo "${id/--id /} < 1" | bc -l) )); then

  ### Clustering
  checkerror=$(
  vsearch \
  --cluster_size $output_dir/zOTUs.fasta \
  $id \
  $simtype \
  $strands \
  $relabel_in \
  $qmask \
  $maxaccepts \
  $maxrejects \
  $cores \
  --centroids $output_dir/OTUs.fasta \
  --uc $output_dir/OTUs.uc \
  --fasta_width 0 \
  --sizein --sizeout \
  2>&1)
  check_app_error

  ## OTU table creation
  # checkerror=$(
  # vsearch \
  # --usearch_global $output_dir/Dereplicated_samples.fasta \
  # --db $output_dir/OTUs.fasta \
  # $id \
  # $strands \
  # $qmask \
  # $dbmask \
  # --sizein --sizeout \
  # $cores \
  # --otutabout $output_dir/OTU_table.txt \
  # 2>&1)
  # check_app_error

  ### OTU table creation
  printf "# Making OTU table \n"
  Rlog=$(Rscript /scripts/submodules/ASV_OTU_merging_script.R \
    --derepuc      tempdir/Glob_derep.uc \
    --uc           "$output_dir"/OTUs.uc \
    --asv          tempdir/ASV_table_long.txt \
    --rmsingletons TRUE \
    --output       "$output_dir"/OTU_table.txt 2>&1)
  echo $Rlog > $output_dir/R_run.log 
  wait
  printf "\n OTU table DONE \n"

fi # end of OTU clustering

#################################################
### COMPILE FINAL STATISTICS AND README FILES ###
#################################################
printf "\nCleaning up and compiling final stats files ...\n"
rm $output_dir/Glob_derep.fasta
rm $output_dir/Dereplicated_samples.fasta

#Delete decompressed files if original set of files were compressed
if [[ $check_compress == "gz" ]] || [[ $check_compress == "zip" ]]; then
    rm *.$newextension
fi

#Delete tempdirs
if [ -d tempdir ]; then
    rm -rf tempdir
fi
if [ -d tempdir_denoize ]; then
    rm -rf tempdir_denoize
fi
if [ -d tempdir_chimera ]; then
    rm -rf tempdir_chimera
fi


size_zotu=$(grep -c "^>" $output_dir/zOTUs.fasta)

#Make README.txt file
printf "Sequence denoizing formed $size_zotu zOTUs (zero-radius OTUs);
'$output_dir' directory contains FASTA formated denoized sequences (zOTUs.fasta)
and an zOTU distribution table per sample (per input file in the working directory), zOTU_table.txt.
\n" > $output_dir/README.txt

## If additional clustering was performed
if (( $(echo "${id/--id /} < 1" | bc -l) )); then
    size_otu=$(grep -c "^>" $output_dir/OTUs.fasta)
    printf "Additional sequence clustering at $id similarity threshold formed $size_otu OTUs;
    '$output_dir' directory contains FASTA formated representative OTU sequences (OTUs.fasta)
    and an OTU distribution table per sample (per input file in the working directory), OTU_table.txt.
    \n" >> $output_dir/README.txt
fi

## Chimera stats
if [[ $chimerarm == "TRUE" ]]; then
    printf "Chimera removal step eliminated $chimeras sequences\n" >> $output_dir/README.txt
fi

## ////  maybe add minsize validation here ???
printf "If samples are denoised individually rather by pooling all samples together, 
reducing minsize to 4 is more reasonable for higher sensitivity.
\n" >> $output_dir/README.txt


#Done
printf "\nDONE\n"
printf "Data in directory '$output_dir'\n"
printf "Check README.txt files in output directory for further information about the process.\n"

end=$(date +%s)
runtime=$((end-start))
printf "Total time: $runtime sec.\n\n"

#variables for all services
echo "workingDir=/$output_dir"
echo "fileFormat=$newextension"
echo "dataFormat=$dataFormat"
echo "readType=single-end"
