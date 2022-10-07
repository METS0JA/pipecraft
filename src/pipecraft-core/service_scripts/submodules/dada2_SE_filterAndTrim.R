#!/usr/bin/env Rscript

#DADA2 SE data quality filtering.

#load dada2
library('dada2')

#load env variables
fileFormat = Sys.getenv('fileFormat')

#load variables
maxEE = as.numeric(Sys.getenv('maxEE'))
maxN = as.numeric(Sys.getenv('maxN'))
truncQ = as.numeric(Sys.getenv('truncQ'))
truncLen_R1 = as.numeric(Sys.getenv('truncLen'))
minLen = as.numeric(Sys.getenv('minLen'))
maxLen = as.numeric(Sys.getenv('maxLen'))
minQ = as.numeric(Sys.getenv('minQ'))

#output path
path_results = "/input/qualFiltered_out"

#define input and output file paths
fnFs = sort(list.files(pattern = fileFormat, full.names = TRUE))
print(fnFs)
#sample names
sample_names = sapply(strsplit(basename(fnFs), fileFormat), `[`, 1)

#filtered files path
filtFs = file.path(path_results, paste0(sample_names, "filt.", "fastq"))

names(filtFs) = sample_names
print(filtFs)

#quality filter
qfilt = filterAndTrim(fnFs, filtFs, 
                    maxN = maxN, 
                    maxEE = maxEE, 
                    truncQ = truncQ,  
                    truncLen = truncLen_R1,
                    maxLen = maxLen, 
                    minLen = minLen, 
                    minQ = minQ, 
                    rm.phix = TRUE, 
                    compress = FALSE, 
                    multithread = TRUE)
saveRDS(qfilt, file.path(path_results, "quality_filtered.rds"))

#seq count summary
getN <- function(x) sum(getUniques(x))
seq_count <- cbind(qfilt)
colnames(seq_count) <- c("input", "qualFiltered")
rownames(seq_count) <- sample_names
write.table(seq_count, file.path(path_results, "seq_count_summary.txt"), sep = "\t", col.names = NA, row.names = TRUE, quote = FALSE)

#save R objects for assembly process
filtered = sort(list.files(path_results, pattern = "filt.", full.names = TRUE))
sample_names = sapply(strsplit(basename(filtered), "filt."), `[`, 1)
saveRDS(filtered, file.path(path_results, "filtFs.rds"))
saveRDS(sample_names, file.path(path_results, "sample_names.rds"))

#DONE, proceed with quality_filtering_single_end_dada2.sh to clean up make readme
