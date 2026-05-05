#!/usr/bin/env Rscript

 # 1. add sequences to the table
 # 2. export sequences with the size annotation

# load variables (the wrapper passes named args)
args <- commandArgs(trailingOnly = TRUE)

get_arg_value <- function(flag) {
  idx <- match(flag, args)
  if (!is.na(idx) && length(args) >= idx + 1) return(args[[idx + 1]])
  ""
}

otu_table_file <- get_arg_value("--table")
fasta_file <- get_arg_value("--fasta_file")

if (otu_table_file == "" || fasta_file == "") {
  stop("Missing inputs. Expected: --table <table.tsv> --fasta_file <seqs.fasta>")
}

### Load OTU table
suppressMessages(library(data.table))
cat(";; Loading input table:", otu_table_file, "\n")
otu_table = fread(
  file = otu_table_file,
  sep = "\t", header = TRUE)

base_name = tools::file_path_sans_ext(basename(otu_table_file))
output_name = paste0(base_name, "_wSeqs.txt")

### Load fasta file and add sequences back to the table
cat(";; Adding sequences back to the table\n")
suppressMessages(library(Biostrings))
suppressMessages(library(dplyr)) 
# read the FASTA file
cat(";; Loading input FASTA:", fasta_file, "\n")
fasta_sequences = readDNAStringSet(fasta_file)
sequences = as.character(fasta_sequences)
names(sequences) = names(fasta_sequences)

# Feature/OTU id column is assumed to be the 1st column
id_col <- names(otu_table)[1]
if (is.na(id_col) || id_col == "") stop("Could not determine feature ID column (1st column) from input table.")
if (id_col != "OTU") otu_table <- dplyr::rename(otu_table, OTU = dplyr::all_of(id_col))

# add the sequences as 2nd column (match by OTU IDs to FASTA headers)
otu_table <- otu_table %>%
  mutate(Sequence = sequences[as.character(.data$OTU)]) %>%
  select(OTU, Sequence, everything())

## Export table
cat(";; Exporting table with sequences (2nd col is sequence) \n")
cat(";; ", output_name, "\n")
fwrite(x = otu_table,
  file = output_name,
  sep = "\t", compress = "none")

cat(";; Done \n")
