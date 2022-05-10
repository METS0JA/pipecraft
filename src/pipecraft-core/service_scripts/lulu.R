#!/usr/bin/env Rscript

#load env variables
# workingDir = Sys.getenv('workingDir')

#load OTU table and match list
otutab="OTU_table.txt"
matchlist="match_list.lulu"

#load variables
min_ratio_type = Sys.getenv('min_ratio_type')
min_ratio = as.numeric(Sys.getenv('min_ratio'))
min_match = as.numeric(Sys.getenv('min_match'))
min_rel_cooccurence = as.numeric(Sys.getenv('min_rel_cooccurence'))

#Run lulu in R
library(devtools)

sessionInfo()

otutable_name <- read.table(otutab, header = T, row.names = 1)
matchlist_name <- read.table(matchlist)
curated_result <- lulu::lulu(otutable_name, matchlist_name, 
	minimum_ratio_type = min_ratio_type, 
	minimum_ratio = min_ratio, 
	minimum_match = min_match, 
	minimum_relative_cooccurence = min_rel_cooccurence)

#write post-clustered OTU table to file
write.table(curated_result$curated_table, file ="lulu_out_table.txt", sep = "\t")
write.table(curated_result$discarded_otus, file ="discarded_units.lulu")



