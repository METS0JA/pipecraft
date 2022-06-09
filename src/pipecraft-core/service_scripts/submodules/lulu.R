#!/usr/bin/env Rscript
library(devtools)

#load variables
min_ratio_type = Sys.getenv('min_ratio_type')
min_ratio = as.numeric(Sys.getenv('min_ratio'))
min_match = as.numeric(Sys.getenv('min_match'))
min_rel_cooccurence = as.numeric(Sys.getenv('min_rel_cooccurence'))

#load OTU table and match list
otutable_name = read.table(file.path("/input/lulu_out", "OTU_tab_for_lulu.txt"), header = T, row.names = 1, sep = "\t")
matchlist_name = read.table(file.path("/input/lulu_out", "match_list.lulu"))

curated_result <- lulu::lulu(otutable_name, matchlist_name, 
	minimum_ratio_type = min_ratio_type, 
	minimum_ratio = min_ratio, 
	minimum_match = min_match, 
	minimum_relative_cooccurence = min_rel_cooccurence)

#get OTU ids from curated table 
write.table(rownames(curated_result$curated_table), file ="/input/lulu_out/lulu_out_OTUids.txt", row.names = FALSE, quote = FALSE)

#write post-clustered OTU table to file
write.table(curated_result$curated_table, file ="/input/lulu_out/lulu_out_table.txt", sep = "\t", col.names = NA, row.names = TRUE, quote = FALSE)
write.table(curated_result$discarded_otus, file ="/input/lulu_out/discarded_units.lulu", col.names = FALSE, quote = FALSE)

#Remove original OTU table from $outputdir
if (file.exists((file.path("/input/lulu_out", "OTU_tab_for_lulu.txt")))) {
    unlink((file.path("/input/lulu_out", "OTU_tab_for_lulu.txt")))
}

#DONE, proceed with lulu.sh to clean up make readme
