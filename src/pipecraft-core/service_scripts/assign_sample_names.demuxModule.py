#!/usr/bin/python

#Renaming files when using combinatorial dual indexes for demultiplexing, using cutadapt

from Bio import SeqIO
from sys import argv
import os

print("python module running")

#usage: script.py $indexes_file
script, indexes_file = argv

#read file extension from bash variable
extension = os.environ["newextension"]

#read demultiplexed file names
demux_files = open("tempdir2/demux_files.txt", 'r')
for line in demux_files:
	el = line.strip()
	el = el.split("-")

	#el[0] forward index name
	#el[1] reverse index name

	#open fwd index file and seach index seq for matching index name
	with open("tempdir2/barcodes_fwd.uniq.renamed.fasta") as indexes_fwd:
		for record in SeqIO.parse(indexes_fwd, "fasta"):
			if el[0] in record.id:

				#open rev index file and seach index seq for matching index name
				with open("tempdir2/barcodes_rev.uniq.renamed.fasta") as indexes_rev:
					for record2 in SeqIO.parse(indexes_rev, "fasta"):
						if el[1] in record2.id:

							#open paired-indexes file
							with open(indexes_file) as indexes_all:
								for record3 in SeqIO.parse(indexes_all, "fasta"):
									if record.seq in record3.seq:
										if record2.seq in record3.seq:
											#print(el[0] + " and " + el[1] + " combo ->  " + record3.id + ", with indexes " + record3.seq)
											sampl_nameR1 = "demultiplex_out/" + str(record3.id) + ".R1." + str(extension)
											sampl_nameR2 = "demultiplex_out/" + str(record3.id) + ".R2." + str(extension)

											line_R1 = "demultiplex_out/" + line.strip() + ".R1." + str(extension)
											line_R2 = "demultiplex_out/" + line.strip() + ".R2." + str(extension)

											#rename files
											if os.path.isfile(line_R1):
												os.rename(line_R1, sampl_nameR1)
											if os.path.isfile(line_R2):
												os.rename(line_R2, sampl_nameR2)
print("python module finished")