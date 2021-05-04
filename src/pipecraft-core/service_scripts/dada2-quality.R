#!/usr/bin/env Rscript
#load dada2
library("dada2")

#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-quality-filter-output")) {
    unlink("/input/dada2-quality-filter-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-quality-filter-output')



#load environment variables
readTypes =Sys.getenv('readType')
fileFormat = Sys.getenv('fileFormat')
dataFormat = Sys.getenv('dataFormat')
workingDir = Sys.getenv('workingDir')
maxEE = as.numeric(Sys.getenv('maxEE'))
maxN = as.numeric(Sys.getenv('maxN'))
truncQ = as.numeric(Sys.getenv('truncQ'))
truncLen = as.numeric(Sys.getenv('truncLen'))
minLen = as.numeric(Sys.getenv('minLen'))
maxLen = as.numeric(Sys.getenv('maxLen'))
minQ = as.numeric(Sys.getenv('minQ'))

#define input and output file paths
fnFs <- sort(list.files(pattern = "_R1", full.names = TRUE))
fnRs <- sort(list.files(pattern = "_R2", full.names = TRUE))
filtFs <- file.path("/input/dada2-quality-filter-output", basename(fnFs))
filtRs <- file.path("/input/dada2-quality-filter-output", basename(fnRs))
print(fnFs)
print(fnRs)
print(filtFs)
print(filtRs)



#filter

out <- filterAndTrim(fnFs, filtFs, fnRs, filtRs, maxN = maxN, maxEE = maxEE, 
    truncQ = truncQ,  truncLen=truncLen, maxLen=maxLen, minLen = minLen, minQ=minQ, rm.phix = TRUE, compress = FALSE, multithread = FALSE)

#show stats
print(out)
print('workingDir=/input/dada2-quality-filter-output')
print('fileFormat=fastq')
print('dataFormat=demultiplexed')
print('readType=paired-end')
