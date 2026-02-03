import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [NgFor],
  templateUrl: './projects.component.html'
})
export class ProjectsComponent {
  projects = [
    {
      name: 'Network refresh for Northwind',
      owner: 'Tara',
      status: 'Active',
      timeline: 'Mar 4 - Jun 30'
    },
    {
      name: 'Helpdesk automation rollout',
      owner: 'Luis',
      status: 'Blocked',
      timeline: 'Feb 12 - Apr 15'
    },
    {
      name: 'VPN upgrade',
      owner: 'Casey',
      status: 'Active',
      timeline: 'Mar 10 - May 1'
    }
  ];
}
