Files in 'chimeraFiltered_out' directory represent chimera filtered sequences.
Files in 'chimeraFiltered_out/chimeras' directory represent identified putative chimeric sequences.
In input was FASTQ formatted file(s), then it was converted to FASTA (chimeraFiltered_out/FASTA), and only FASTA is outputted.

Core commands -> 
denovo filtering: vsearch --uchime_denovo input.preclustered.fasta --abskew 2 --minh 0.28 --sizein --sizeout --fasta_width 0 --chimeras chimeras/output.denovo.chimeras.fasta --nonchimeras output.fasta
reference based filtering: vsearch --uchime_ref input.fasta --threads 4 --db database_file --sizein --sizeout --fasta_width 0 --chimeras chimeras/output.ref.chimeras.fasta --nonchimeras output.fasta


Summary of sequence counts in 'seq_count_summary.txt'


Total run time was 315 sec.


##################################################################
###Third-party applications for this process [PLEASE CITE]:
#vsearch v2.18.0 for chimera filtering
    #citation: Rognes T, Flouri T, Nichols B, Quince C, Mahé F (2016) VSEARCH: a versatile open source tool for metagenomics PeerJ 4:e2584
    #Copyright (C) 2014-2021, Torbjorn Rognes, Frederic Mahe and Tomas Flouri
    #Distributed under the GNU General Public License version 3 by the Free Software Foundation
    #https://github.com/torognes/vsearch
#seqkit v2.0.0 for converting fastq to fasta (if input was fastq)
    #citation: Shen W, Le S, Li Y, Hu F (2016) SeqKit: A Cross-Platform and Ultrafast Toolkit for FASTA/Q File Manipulation. PLOS ONE 11(10): e0163962. https://doi.org/10.1371/journal.pone.0163962
    #Distributed under the MIT License
    #Copyright © 2016-2019 Wei Shen, 2019 Oxford Nanopore Technologies.
    #https://bioinf.shenwei.me/seqkit/
##########################################################