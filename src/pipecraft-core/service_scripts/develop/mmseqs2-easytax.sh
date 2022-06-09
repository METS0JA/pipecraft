#!/bin/sh
start=`date +%s`

# mmseqs createdb examples/DB.fasta targetDB
# mmseqs createtaxdb targetDB tmp
# mmseqs createindex targetDB tmp
# mmseqs easy-taxonomy examples/QUERY.fasta targetDB alnRes tmp

mmseqs --help

echo "mmseqs"

end=`date +%s`
runtime=$((end-start))
echo $runtime
