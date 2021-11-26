#!/usr/bin/env Rscript
install.packages("devtools" ,repos = "https://ftp.eenet.ee/pub/cran/")
library("devtools")
devtools::install_github("benjjneb/dada2", ref="v1.16")