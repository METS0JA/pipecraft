#!/bin/bash

# MetaWorks EVS pipeline for paired-end data

##########################################################
###Third-party applications:
#MetaWorks v1.11.1
    #citation: Porter, T.M., Hajibabaei, M. 2020. METAWORKS: A flexible, scalable bioinformatic pipeline for multi-marker biodiversity assessments. BioRxiv, doi: https://doi.org/10.1101/2020.07.14.202960.
    #Distributed under the GNU General Public License v3.0
    #https://github.com/terrimporter/MetaWorks
##########################################################

### TODO
# has to be gz files - if not then make to gz! unizip and make gz if needed or just make gz.
# test if metaworks cut primers reorients the reads! 
# validate primers  ok - -> also for cut primers!
################################################################
# Run MetaWorks
echo $UID
echo "Running snakemake"
#checkerror=$(snakemake -h 2>&1)
#check_app_error
conda init bash
exec $SHELL
eval "$(conda shell.bash hook)"
#conda activate MetaWorks_v1.11.1


conda activate MetaWorks_v1.11.1
cd /input


eval "$(conda shell.bash hook)"
conda activate MetaWorks_v1.11.2
snakemake --jobs 1 --snakefile hello_world.txt
#snakemake --jobs 2 --snakefile /input/snakefile_ESV --configfile /input/config_ESV.pipecraft.yaml 


