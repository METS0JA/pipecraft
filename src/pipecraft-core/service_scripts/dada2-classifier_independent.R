#!/usr/bin/env Rscript

#DADA2 sequence classifier.

#load dada2
library("dada2")

#load env variables
readType = Sys.getenv('readType')
fileFormat = Sys.getenv('fileFormat')
dataFormat = Sys.getenv('dataFormat')
workingDir = Sys.getenv('workingDir')

#check for output dir and delete if needed
if (dir.exists("/input/taxonomy_out.dada2")) {
    unlink("/input/taxonomy_out.dada2", recursive=TRUE)
}
#create output dir
path_results = "/input/taxonomy_out.dada2"
dir.create(path_results)

#load environment variables
database = Sys.getenv('dada2_database')
database = gsub("\\\\", "/", database) #replace backslashes \ in the database path
database = paste("/extraFiles", basename(database), sep = "/")
minBoot = as.integer(Sys.getenv('minBoot'))
tryRC = Sys.getenv('tryRC')
print(database)

#"FALSE" or "TRUE" to FALSE or TRUE for dada2
if (tryRC == "false" || tryRC == "FALSE"){
    tryRC = FALSE
}
if (tryRC == "true" || tryRC == "TRUE"){
    tryRC = TRUE
}

#load sequences
seqs_file = list.files(file.path(workingDir), pattern = fileFormat)

#ERROR if multiple fasta files in the folder
if (length(seqs_file) > 1) {
    write("Multiple inputa fasta files in the workingDir, QUITTING", stderr())
    quit(save = "no")

} else {
    print(paste0("input = ", seqs_file))
}

#assign taxonomy
tax = assignTaxonomy(seqs_file, database, multithread = FALSE, minBoot = minBoot, tryRC = tryRC, outputBootstraps = TRUE)
#add sequence names to tax table
tax2 = cbind(row.names(tax$tax), tax$tax, tax$boot)
colnames(tax2)[1] = "Sequence"
#write taxonomy to csv
write.table(tax2, file.path(path_results, "taxonomy.csv"), sep = "\t", quote=F, col.names = NA)

#DONE
print('workingDir=/input/taxonomy_out.dada2')
print('fileFormat=taxtab')
print('dataFormat=demultiplexed')
print('readType=single_end')
