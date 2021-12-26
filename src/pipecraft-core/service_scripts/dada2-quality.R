#!/usr/bin/env Rscript

#DADA2 quality filtering.

#load dada2
library('dada2')

#load env variables
readType = Sys.getenv('readType')
fileFormat = Sys.getenv('fileFormat')
dataFormat = Sys.getenv('dataFormat')
workingDir = Sys.getenv('workingDir')

#load variables
read_R1 = Sys.getenv('read_R1')
read_R2 = Sys.getenv('read_R2')
samp_ID = Sys.getenv('samp_ID')
maxEE = as.numeric(Sys.getenv('maxEE'))
maxN = as.numeric(Sys.getenv('maxN'))
truncQ = as.numeric(Sys.getenv('truncQ'))
truncLen_R1 = as.numeric(Sys.getenv('truncLen'))
truncLen_R2 = as.numeric(Sys.getenv('truncLen_R2'))
minLen = as.numeric(Sys.getenv('minLen'))
maxLen = as.numeric(Sys.getenv('maxLen'))
minQ = as.numeric(Sys.getenv('minQ'))

#check for output dir and delete if needed
if (dir.exists("/input/qualFiltered_out.dada2")) {
    unlink("/input/qualFiltered_out.dada2", recursive=TRUE)
}
#create output dir
path_results = "/input/qualFiltered_out.dada2"
dir.create(path_results)

#define input and output file paths
fnFs = sort(list.files(pattern = read_R1, full.names = TRUE))
fnRs = sort(list.files(pattern = read_R2, full.names = TRUE))
#sample names
sample_names = sapply(strsplit(basename(fnFs), samp_ID), `[`, 1)
print(sample_names)

#filtered files path
filtFs = file.path(path_results, paste0(sample_names, "_R1_filt.", fileFormat))
filtRs = file.path(path_results, paste0(sample_names, "_R2_filt.", fileFormat))
names(filtFs) = sample_names
names(filtRs) = sample_names

print(filtFs)
print(filtRs)

#quality filter
qfilt = filterAndTrim(fnFs, filtFs, fnRs, filtRs, 
                    maxN = maxN, 
                    maxEE = c(maxEE, maxEE), 
                    truncQ = truncQ,  
                    truncLen= c(truncLen_R1, truncLen_R2),
                    maxLen=maxLen, 
                    minLen = minLen, 
                    minQ=minQ, 
                    rm.phix = TRUE, 
                    compress = FALSE, 
                    multithread = TRUE)

#save R objects for assembly process
saveRDS(filtFs, file.path(path_results, "filtFs.rds"))
saveRDS(filtRs, file.path(path_results, "filtRs.rds"))
saveRDS(sample_names, file.path(path_results, "sample_names.rds"))
saveRDS(qfilt, file.path(path_results, "quality_filtered.rds"))

#seq count summary
getN <- function(x) sum(getUniques(x))
seq_count <- cbind(qfilt)
colnames(seq_count) <- c("input", "qualFiltered")
rownames(seq_count) <- sample_names
write.csv(seq_count, file.path(path_results, "seq_count_summary.csv"), row.names = TRUE)

#DONE

print('workingDir=/input/qualFiltered_out.dada2')
print('fileFormat=fastq')
print('dataFormat=demultiplexed')
print('readType=paired_end')
