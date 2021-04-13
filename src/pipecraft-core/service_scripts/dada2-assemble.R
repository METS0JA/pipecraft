#!/usr/bin/env Rscript
#load dada2
library("dada2")
fnFs <- sort(list.files(pattern = glob2rx("*_R1*fastq"), full.names = TRUE))
fnRs <- sort(list.files(pattern = glob2rx("*_R2*fastq"), full.names = TRUE))
print(fnFs)
print(fnRs)

dadaF <- dada(fnFs, selfConsist=TRUE)
dadaR <- dada(fnRs, selfConsist=TRUE)
merger <- mergePairs(dadaF, fnF, dadaR, fnR)
print(merger)



#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-assemble-output")) {
    unlink("/input/dada2-assemble-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-assemble-output')

#load environment variables
minOverlap = Sys.getenv('minOverlap')
maxMismatch = Sys.getenv('maxMismatch')
returnRejects = Sys.getenv('returnRejects')


print(minOverlap)
print(maxMismatch)
print(returnRejects)