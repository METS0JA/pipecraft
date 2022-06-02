#!/bin/bash

## DEICODE (Robust Aitchison PCA on sparse compositional metabarcoding data)
# Step 1. rCLR
#   Data transformation using centered log ratio on only non-zero values (no pseudo count added)
# Step 2. RPCA
#   Dimensionality reduction through robust PCA on only the non-zero values of the data
#   Sparse data handled through the use of matrix completion (all zeros are treated as missing values)

## See method description in Martino et al., 2019 (DOI 10.1128/mSystems.00016-19)


##########################################################
###Third-party applications:
#DEICODE v0.2.3
    #citation: Martino C., Morton J.T., Marotz C.A., Thompson L.R., Tripathi A., Knight R., et al. (2019). A Novel Sparse Compositional Technique Reveals Microbial Perturbations. mSystems. doi: 10.1128/mSystems.00016-19. 
    #Distributed under the BSD-3 license
    #https://github.com/biocore/DEICODE
#biom-format v2.1.12
    #citation: McDonald D., Clemente J.C., Kuczynski J., Rideout J.R., Stombaugh J., Wendel D., et al. (2012). The Biological Observation Matrix (BIOM) format or: how I learned to stop worrying and love the ome-ome. GigaScience 1, 2047-217X-1–7. doi: 10.1186/2047-217X-1-7.
    #Distributed under the Modified BSD License
    #https://biom-format.org/
##################################################################


## Input:
# otu_table = tab-delimited OTU table (columns = samples, rows = OTUs)
# otu_subset = optional, (one ID per row)
# min_otu_reads = threshold for the minimum number of reads per OTU across all samples
# min_sample_reads = threshold for the minimum number of reads per sample across all OTUs

## Dependencies:
# subset_otu_table.R
# rpca_script.py

## Load variables
otu_table="OTU_table.txt"
otu_subset="OTU_subset_IDs.txt"
min_otu_reads=10
min_sample_reads=500
#  Default thresholds are the same as in DEICODE

## Outputs
output_dir="DEICODE"
output_biom="$output_dir"/otutab.biom
output_deicode_full="$output_dir"/full
output_deicode_subs="$output_dir"/subs
otu_table_subs="$output_dir"/rclr_subset.tsv

mkdir -p "$output_dir"

## Prepare BIOM file
printf "# Preparing BIOM file\n"
biom convert \
  -i "$otu_table" \
  -o "$output_biom" \
  --table-type="OTU table" \
  --to-hdf5

## rCLR and RPCA on an OTU table with all OTUs
printf "# Running DEICODE on a full OTU table\n"
deicode auto-rpca \
    --in-biom "$output_biom" \
    --min-feature-count "$min_otu_reads" \
    --min-sample-count "$min_sample_reads" \
    --output-dir "$output_deicode_full"

# rCLR-transformed table
output_rclr="$output_deicode_full"/rclr.tsv


## RPCA on a subset of OTU table
if [[ $otu_subset != null ]]; then
    printf "# Preparing a subset of rCLR-transformed OTU table\n"

    Rscript subset_otu_table.R \
      --input "$output_rclr" \
      --subset "$otu_subset" \
      --output "$otu_table_subs"

    printf "# Running DEICODE on a subset of OTU table\n"
    python rpca_script.py "$otu_table_subs" "$output_deicode_subs"

else 
    printf "# No OTU IDs specified\n"
fi

## Output
# DEICODE/
#   - otutab.biom          =  full OTU table in BIOM format
#   - rclr_subset.tsv      =  rCLR-transformed subset of OTU table *
# DEICODE/full/
#   - distance-matrix.tsv  =  distance matrix between the samples, based on full OTU table
#   - ordination.txt       =  ordination scores for samples and OTUs, based on full OTU table
#   - rclr.tsv             =  rCLR-transformed OTU table
# DEICODE/subs/
#   - distance-matrix.tsv  =  distance matrix between the samples, based on a subset of OTU table *
#   - ordination.txt       =  ordination scores for samples and OTUs, based a subset of OTU table *
#
# *, files are present only if $otu_subset variable was specified
