#!/usr/bin/env Rscript

#DADA2 denoising and merging paired-end data

#load dada2
library('dada2')

#load env variables
readType = Sys.getenv('readType')
fileFormat = Sys.getenv('fileFormat')
dataFormat = Sys.getenv('dataFormat')
workingDir = Sys.getenv('workingDir')

#load  variables
minOverlap = as.numeric(Sys.getenv('minOverlap'))
maxMismatch = as.numeric(Sys.getenv('maxMismatch'))
trimOverhang = Sys.getenv('trimOverhang')
justConcatenate = Sys.getenv('justConcatenate')
pool = Sys.getenv('pool')
selfConsist = Sys.getenv('selfConsist')
qualityType = Sys.getenv('qualityType')

#"FALSE" or "TRUE" to FALSE or TRUE for dada2
if (pool == "false" || pool == "FALSE"){
    pool = FALSE
}
if (pool == "true" || pool == "TRUE"){
    pool = TRUE
}
if (selfConsist == "false" || selfConsist == "FALSE"){
    selfConsist = FALSE
}
if (selfConsist == "true" || selfConsist == "TRUE"){
    selfConsist = TRUE
}
if (trimOverhang == "false" || trimOverhang == "FALSE"){
    trimOverhang = FALSE
}
if (justConcatenate == "false" || justConcatenate == "FALSE"){
    justConcatenate = FALSE
}
if (trimOverhang == "true" || trimOverhang == "TRUE"){
    trimOverhang = TRUE
}
if (justConcatenate == "true" || justConcatenate == "TRUE"){
    justConcatenate = TRUE
}

### Denoise
if (pool != ""){
    #check for output dir and delete if needed
    if (dir.exists("/input/denoised_assembled.dada2")) {
        unlink("/input/denoised_assembled.dada2", recursive=TRUE)
    }
    #create output dir
    path_results = "/input/denoised_assembled.dada2/"
    dir.create(path_results)

    #filtered files path
    filtFs = readRDS(file.path(workingDir, "filtFs.rds"))
    filtRs = readRDS(file.path(workingDir, "filtRs.rds"))
    sample_names = readRDS(file.path(workingDir, "sample_names.rds"))
    print(sample_names)

    #Learn the error rates
    errF = learnErrors(filtFs, multithread = FALSE)
    errR = learnErrors(filtRs, multithread = FALSE)

    #Error rate figures
    pdf(file.path(path_results, "Error_rates_R1.pdf"))
      print( plotErrors(errF) )
    dev.off()
    pdf(file.path(path_results, "Error_rates_R2.pdf"))
      print( plotErrors(errR) )
    dev.off()

    #dereplicate
    derepFs = derepFastq(filtFs, qualityType = qualityType)
    derepRs = derepFastq(filtRs, qualityType = qualityType)
    saveRDS(derepFs, (file.path(path_results, "derepFs.rds")))
    saveRDS(derepRs, (file.path(path_results, "derepRs.rds")))

    #denoise
    dadaFs = dada(derepFs, err = errF, pool = pool, selfConsist = selfConsist, multithread = FALSE)
    dadaRs = dada(derepRs, err = errR, pool = pool, selfConsist = selfConsist, multithread = FALSE)
    saveRDS(dadaFs, (file.path(path_results, "dadaFs.rds")))
    saveRDS(dadaRs, (file.path(path_results, "dadaRs.rds")))
}

### Merge denoised paired-end reads
if (pool == ""){
    path_results = "/input/denoised_assembled.dada2/"
    #load denoised data
    dadaFs = readRDS(file.path(path_results, "dadaFs.rds"))
    dadaRs = readRDS(file.path(path_results, "dadaRs.rds"))
    derepFs = readRDS(file.path(path_results, "derepFs.rds"))
    derepRs = readRDS(file.path(path_results, "derepRs.rds"))
    sample_names = readRDS("/input/qualFiltered_out/sample_names.rds")
    qfilt = readRDS("/input/qualFiltered_out/quality_filtered.rds")

    #merge paired-end reads
    merge = mergePairs(dadaFs, derepFs, dadaRs, derepRs, 
                            maxMismatch = maxMismatch,
                            minOverlap = minOverlap,
                            justConcatenate = justConcatenate,
                            trimOverhang = trimOverhang)

    ### WRITE PER-SAMPLE DENOISED and MERGED FASTA FILES
    #make sequence table
    ASV_tab = makeSequenceTable(merge)
    #write RDS object
    saveRDS(ASV_tab, (file.path(path_results, "ASVs_table.denoised-merged.rds")))

    #sequence headers
    asv_seqs = colnames(ASV_tab)
    asv_headers = vector(dim(ASV_tab)[2], mode="character")
    for (i in 1:dim(ASV_tab)[2]) {
    asv_headers[i] = paste(">ASV", i, sep="_")
    }
    #transpose sequence table
    ASV_tab = t(ASV_tab)
    #add sequences to 1st column
    ASV_tab = cbind(row.names(ASV_tab), ASV_tab)
    colnames(ASV_tab)[1] = "Sequence"
    #row names as sequence headers
    row.names(ASV_tab) = sub(">", "", asv_headers)

    #Loop through each sample in the table and write per-sample fasta files
    for (i in 2:length(colnames(ASV_tab))){
        sample_name = colnames(ASV_tab)[i]
        sample_file = paste(sample_name, "merged_ASVs.fasta", sep = ".") 
        j = 0
        for (abundance in ASV_tab[,i]){
            j = j + 1
            if (abundance != 0){
                #seq header and abundance
                header = paste(">", row.names(ASV_tab)[j], ";size=", abundance, sep = "")
                write(header, file.path(path_results, sample_file), append = TRUE)
                #sequence
                seq = ASV_tab[j, 1]
                write(seq, file.path(path_results, sample_file), append = TRUE)
            }
        }
    }

    #seq count summary
    getN <- function(x) sum(getUniques(x))
    seq_count <- cbind(qfilt, sapply(dadaFs, getN), sapply(dadaRs, getN), sapply(merge, getN))
    colnames(seq_count) <- c("input", "qualFiltered", "denoised_R1", "denoised_R2", "merged")
    rownames(seq_count) <- sample_names
    write.table(seq_count, file.path(path_results, "seq_count_summary.txt"), sep = "\t", col.names = NA, row.names = TRUE, quote = FALSE)
}

#DONE 

