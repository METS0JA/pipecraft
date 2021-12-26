Example dataset consists of 200 random non-biological sequences.
Second half of the dataset consists of reverse-complementary sequences of the first half (100/100).

forward primer: AAGCTTGGCAGCTCGCAGCGCTCTA
reverse primer: TATAACTGAAATGTAGGGGATCGTA

Dummy qualities of all bases = 38.

Multiprimer artefacts = 4 sequences (sequence1, sequence2, sequence_revcomp_1 and sequence_revcomp_2) 

#DEMULTIPLEXING
1) paired-indexes: 93 samples (each sample has 2 seqs); 14 seqs in unknown.fastx
2) single-indexes-fwd: 9 samples, no seqs in unknown.fastx.
3) single-indexes-rev: 11 samples; 14 seqs in unknown.fastx
 
#REOTIENTING
sequence100 and sequence _revcomp_100 discarded (primers not found)
4 sequences (sequence1, sequence2, sequence_revcomp_1 and sequence_revcomp_2) discarded as 'multiprimer' artefacts

#CUT PRIMERS
No seq discarded, all contain primers

#Chimera filtering
0 chimeras 
