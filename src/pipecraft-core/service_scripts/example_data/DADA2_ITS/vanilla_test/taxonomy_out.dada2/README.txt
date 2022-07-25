Taxonomy annotation with DADA2 classifier (function assignTaxonomy).
# taxonomy.txt = classifier results with bootstrap values.

Core command -> 
tax = assignTaxonomy(ASVs.fasta, /input/database/sh_general_release.fasta, multithread = FALSE, minBoot = 50, tryRC = false, outputBootstraps = TRUE)

Total run time was 0 sec.

##########################################################
###Third-party applications [PLEASE CITE]:
#dada2 v1.20
    #citation: Callahan, B., McMurdie, P., Rosen, M. et al. (2016) DADA2: High-resolution sample inference from Illumina amplicon data. Nat Methods 13, 581-583. https://doi.org/10.1038/nmeth.3869
##################################################################