#!/usr/bin/env Rscript
#load dada2


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
minOverlap = Sys.getenv('minOverlap')
maxMismatch = Sys.getenv('maxMismatch')
returnRejects = Sys.getenv('returnRejects')

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
