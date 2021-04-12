#load dada2
library("dada2")

#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-classifier-output")) {
    unlink("/input/dada2-classifier-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-classifier-output')

#load environment variables
database = Sys.getenv('database')


#define input and output file paths
seqtab.nochim = list.files(pattern = "nochim")
output = paste('/input/dada2-classifier-output/',input, sep="")

#save parameters to comma separated string
library(stringr)
parameters = paste(database, sep=', ')
parameters = str_replace_all(parameters, ', ,', ',')

#construct the full command for execution
command = paste(taxa <- assignTaxonomy(seqtab.nochim, parameters, multithread=TRUE))


#turns string into an expression, and evaluates the expression.

#show stats
command
head(out)
