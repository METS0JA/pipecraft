seqs = sort(list.files(pattern = glob2rx("*R1*fastq*"), full.names = TRUE))
sample.names <- sapply(strsplit(basename(seqs), "_"), `[`, 1)

filtSeqs <- file.path(path, "filtered", paste0(sample.names, "_filtered.fastq"))
filterAndTrim(seqs, filtSeqs, cutRs, filtRs, maxN = 0, maxEE = c(2, 2), 
errSeqs = learnErrors(filtSeqs, multithread = TRUE)
derepSeqs = derepFastq(filtSeqs)
dadaSeqs = dada(derepSeqs, err = errSeqs, multithread=TRUE)
seqTable = makeSequenceTable(dadaSeqs)
