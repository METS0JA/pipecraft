#!/bin/bash

echo 'testing snakemake'
eval "$(conda shell.bash hook)"
conda activate MetaWorks_v1.11.2
snakemake -h
snakemake --jobs 1 --snakefile hello_world.txt


