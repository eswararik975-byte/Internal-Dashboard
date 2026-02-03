import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  metrics = [
    { label: 'Active projects', value: 6 },
    { label: 'Work logs today', value: 18 },
    { label: 'Hours this week', value: '156h' }
  ];

  recentUpdates = [
    { title: 'Network refresh for Northwind', owner: 'Tara', status: 'On track' },
    { title: 'Helpdesk automation rollout', owner: 'Luis', status: 'Blocked' },
    { title: 'VPN upgrade', owner: 'Casey', status: 'On track' }
  ];
}
