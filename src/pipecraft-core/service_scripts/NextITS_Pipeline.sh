#!/bin/bash


export NXF_HOME="/opt/software/conda/bin"
export NXF_ANSI_LOG="false"
export NXF_LOG_COLOR="false"
export NXF_ANSI="false"
export TERM="dumb"
BASEDIR=$(pwd)

ls -la

## Run Step-1 for all sequencing runs
find /Input/ -mindepth 1 -maxdepth 1 -type d \
  ! -name ".nextflow" \
  ! -name "Step1_Results" \
  ! -name "Step1_WorkDirs" \
  ! -name "Step2_Results" \
  ! -name "Step2_WorkDir" \
  | sort \
  | parallel -j1 --joblog /Input/Step1.log \
  "/scripts/submodules/NextITS_Step1.sh {/}"




## Step-2 - standard VSEARCH clustering

stdbuf -oL -eL \
  nextflow run /opt/pipelines/NextITS/main.nf \
  -resume \
  --storagemode "copy" \
  -params-file /scripts/NextFlowConfig.json \
  --step "Step2" \
  --data_path  /Input/Step1_Results \
  --outdir     /Input/Step2_Results \
  -work-dir    /Input/Step2_WorkDir \
  --tracedir   /Input/Step2_WorkDir/pipeline_info \
  -ansi-log    false \
  2>&1 | sed -E 's/\x1B\[[0-9;]*[A-Za-z]//g' \
       | tr -d '\r' \
       | tr -d '▒░' \
       | tee -a /Input/Nextflow__Step2.log
