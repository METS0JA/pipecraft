#!/usr/bin/env Rscript
#load dada2
library('dada2')


#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-assemble-output")) {
    unlink("/input/dada2-assemble-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-assemble-output')

#load environment variables
readTypes = Sys.getenv('readType')
fileFormat = Sys.getenv('fileFormat')
dataFormat = Sys.getenv('dataFormat')
workingDir = Sys.getenv('workingDir')
minOverlap = as.numeric(Sys.getenv('minOverlap'))
maxMismatch = as.numeric(Sys.getenv('maxMismatch'))
returnRejects = Sys.getenv('returnRejects')

filtFs <- sort(list.files(pattern = "_R1", full.names = TRUE))
filtRs <- sort(list.files(pattern = "_R2", full.names = TRUE))
errF <- learnErrors(filtFs, multithread = TRUE)
errR <- learnErrors(filtRs, multithread = TRUE)
derepFs <- derepFastq(filtFs, verbose = TRUE)
derepRs <- derepFastq(filtRs, verbose = TRUE)
dadaFs <- dada(derepFs, err = errF, multithread = TRUE)
dadaRs <- dada(derepRs, err = errR, multithread = TRUE)
mergers <- mergePairs(dadaFs, derepFs, dadaRs, derepRs, verbose=TRUE)
seqtab <- makeSequenceTable(mergers)
saveRDS(seqtab, "/input/dada2-assemble-output/seqtab.rds")




print(fileFormat)
print(readTypes)
print(dataFormat)
print(workingDir)
print(minOverlap)
print(maxMismatch)
print(returnRejects)
print('workingDir=/input/dada2-assemble-output')
print('fileFormat=fastq')
print('dataFormat=demultiplexed')
print('readType=single-end')
