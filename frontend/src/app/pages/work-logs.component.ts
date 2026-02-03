import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-work-logs',
  standalone: true,
  imports: [NgFor],
  templateUrl: './work-logs.component.html'
})
export class WorkLogsComponent {
  workLogs = [
    {
      date: 'Today',
      project: 'Network refresh for Northwind',
      hours: 3,
      summary: 'Switch inventory + cabling walkthrough.'
    },
    {
      date: 'Today',
      project: 'VPN upgrade',
      hours: 2.5,
      summary: 'Firewall staging and user comms.'
    },
    {
      date: 'Yesterday',
      project: 'Helpdesk automation rollout',
      hours: 4,
      summary: 'Workflow mapping with support team.'
    }
  ];
}
