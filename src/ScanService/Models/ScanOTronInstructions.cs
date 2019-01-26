using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ScanService.Models
{
    public class ScanOTronInstructions
    {
        public ScanOTronInstructions(bool ledStatus, DivertSetting divertSetting)
        {
            LedStatus = ledStatus;
            DivertSetting = divertSetting;
        }

        public bool LedStatus { get; private set; }

        public DivertSetting DivertSetting { get; private set; }
    }
}
