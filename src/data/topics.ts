import type { Topic } from '../types';

export const TOPICS: Topic[] = [
  {
    id: 'networking',
    name: 'Networking',
    desc: 'Subnetting, VLAN, dan simulasi topologi jaringan.',
    docs: ['subnetting-virtualbox-slax', 'vlan-simulasi', 'simulasi-hotspot-gns3'],
    weeks: [1, 2, 4],
  },
  {
    id: 'virtualization',
    name: 'Virtualization',
    desc: 'Proxmox VE, virtual machine, dan Docker.',
    docs: ['proxmox-mikrotik', 'langkah-instalasi-vm-proxmox', 'instalasi-vm-wordpress'],
    weeks: [3, 4],
  },
  {
    id: 'cloud',
    name: 'Cloud & Security',
    desc: 'Cloudflare Tunnel, HTTPS, dan keamanan layanan.',
    docs: ['cloudflare-tunnel'],
    weeks: [3, 4],
  },
  {
    id: 'ai-agent',
    name: 'AI Agent Infrastructure',
    desc: 'Hermes Agent, 9Router, dan integrasi Telegram.',
    docs: ['laporan-hermes-9router'],
    weeks: [5],
  },
];
