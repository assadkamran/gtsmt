export type NavLink = { label: string; href: string; description?: string }
export type NavGroup = { title: string; links: NavLink[] }

export const solutionLinks: NavLink[] = [
  { label: 'Complete SMT Production Lines', href: '/smt-solutions/complete-smt-production-lines', description: 'End-to-end line configurations.' },
  { label: 'Turnkey PCB Assembly Lines', href: '/smt-solutions/turnkey-pcb-assembly-lines', description: 'Specified, supplied and set up together.' },
  { label: 'LED SMT Production Lines', href: '/smt-solutions/led-smt-production-lines', description: 'Lines for LED board assembly.' },
  { label: 'High-Speed SMT Production Lines', href: '/smt-solutions/high-speed-smt-production-lines', description: 'Built around placement throughput.' },
  { label: 'Flexible SMT Production Lines', href: '/smt-solutions/flexible-smt-production-lines', description: 'For high-mix, changing product ranges.' },
  { label: 'SMT Factory Setup', href: '/smt-solutions/smt-factory-setup', description: 'Planning a new SMT facility.' },
  { label: 'Customized SMT Solutions', href: '/smt-solutions/customized-smt-solutions', description: 'Configured to your product and process.' },
]

export const equipmentGroups: NavGroup[] = [
  { title: 'Print and inspect', links: [
    { label: 'Solder Paste Printers', href: '/smt-equipment/solder-paste-printers' },
    { label: 'Solder Paste Inspection (SPI)', href: '/smt-equipment/spi-solder-paste-inspection' },
  ] },
  { title: 'Place', links: [
    { label: 'Pick and Place Machines', href: '/smt-equipment/pick-and-place-machines' },
  ] },
  { title: 'Solder', links: [
    { label: 'Reflow Soldering Ovens', href: '/smt-equipment/reflow-soldering-ovens' },
    { label: 'Wave Soldering Machines', href: '/smt-equipment/wave-soldering-machines' },
  ] },
  { title: 'Inspect and handle', links: [
    { label: 'Automated Optical Inspection (AOI)', href: '/smt-equipment/aoi-automated-optical-inspection' },
    { label: 'PCB Loaders', href: '/smt-equipment/pcb-loaders' },
    { label: 'PCB Unloaders', href: '/smt-equipment/pcb-unloaders' },
    { label: 'PCB Conveyors', href: '/smt-equipment/pcb-conveyors' },
    { label: 'Depaneling Machines', href: '/smt-equipment/pcb-depaneling-machines' },
    { label: 'PCB Cleaning Equipment', href: '/smt-equipment/pcb-cleaning-equipment' },
    { label: 'Storage and Buffer Systems', href: '/smt-equipment/pcb-storage-and-buffer-systems' },
    { label: 'Other SMT Equipment', href: '/smt-equipment/other-smt-equipment' },
  ] },
]

export const partsGroups: NavGroup[] = [
  { title: 'Feeders', links: [
    { label: 'Tape Feeders', href: '/spare-parts/feeders/tape-feeders' },
    { label: 'Electric Feeders', href: '/spare-parts/feeders/electric-feeders' },
    { label: 'Pneumatic Feeders', href: '/spare-parts/feeders/pneumatic-feeders' },
    { label: 'Tray Feeders', href: '/spare-parts/feeders/tray-feeders' },
    { label: 'Stick Feeders', href: '/spare-parts/feeders/stick-feeders' },
    { label: 'Feeder Carts', href: '/spare-parts/feeders/feeder-carts' },
    { label: 'Feeder Accessories', href: '/spare-parts/feeders/feeder-accessories' },
  ] },
  { title: 'Machine parts', links: [
    { label: 'Pick and Place Nozzles', href: '/spare-parts/nozzles' },
    { label: 'Motors', href: '/spare-parts/motors' },
    { label: 'Belts', href: '/spare-parts/belts' },
    { label: 'Sensors', href: '/spare-parts/sensors' },
    { label: 'Valves', href: '/spare-parts/valves' },
    { label: 'Filters', href: '/spare-parts/filters' },
  ] },
  { title: 'Electronics', links: [
    { label: 'Cameras', href: '/spare-parts/cameras' },
    { label: 'Electronic Boards', href: '/spare-parts/electronic-boards' },
    { label: 'Cables', href: '/spare-parts/cables' },
    { label: 'Other Replacement Components', href: '/spare-parts/other-replacement-components' },
  ] },
]

export const peripheralLinks: NavLink[] = [
  { label: 'Magazine Loaders', href: '/smt-peripherals/magazine-loaders' },
  { label: 'Magazine Unloaders', href: '/smt-peripherals/magazine-unloaders' },
  { label: 'PCB Conveyors', href: '/smt-peripherals/pcb-conveyors' },
  { label: 'Inspection Conveyors', href: '/smt-peripherals/inspection-conveyors' },
  { label: 'NG/OK Buffer Systems', href: '/smt-peripherals/ng-ok-buffer-systems' },
  { label: 'PCB Turn Conveyors', href: '/smt-peripherals/pcb-turn-conveyors' },
  { label: 'PCB Lift Conveyors', href: '/smt-peripherals/pcb-lift-conveyors' },
  { label: 'ESD Equipment', href: '/smt-peripherals/esd-equipment' },
  { label: 'Production-Line Accessories', href: '/smt-peripherals/production-line-accessories' },
  { label: 'Other Factory Peripherals', href: '/smt-peripherals/other-factory-peripherals' },
]

export const industryLinks: NavLink[] = [
  { label: 'Automotive Electronics', href: '/industries/automotive-electronics' },
  { label: 'Consumer Electronics', href: '/industries/consumer-electronics' },
  { label: 'LED Manufacturing', href: '/industries/led-manufacturing' },
  { label: 'Medical Electronics', href: '/industries/medical-electronics' },
  { label: 'Industrial Electronics', href: '/industries/industrial-electronics' },
  { label: 'Power Electronics', href: '/industries/power-electronics' },
  { label: 'Telecommunications', href: '/industries/telecommunications' },
  { label: 'EMS and Contract Manufacturing', href: '/industries/ems-and-contract-manufacturing' },
]

export const topLevel: NavLink[] = [
  { label: 'SMT Solutions', href: '/smt-solutions' },
  { label: 'SMT Equipment', href: '/smt-equipment' },
  { label: 'Spare Parts', href: '/spare-parts' },
  { label: 'SMT Peripherals', href: '/smt-peripherals' },
  { label: 'Industries', href: '/industries' },
  { label: 'Resources', href: '/resources' },
  { label: 'About Us', href: '/about-us' },
  { label: 'Contact', href: '/contact' },
  { label: 'Request a Quote', href: '/request-a-quote' },
]

/** Every route the navigation promises. */
export function allNavRoutes(): NavLink[] {
  const flat: NavLink[] = [
    ...topLevel,
    ...solutionLinks,
    ...equipmentGroups.flatMap((g) => g.links),
    ...partsGroups.flatMap((g) => g.links),
    ...peripheralLinks,
    ...industryLinks,
    { label: 'Compare products', href: '/compare', description: 'Compare listed specifications of up to four products from one category side by side.' },
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms', href: '/terms' },
  ]
  const seen = new Set<string>()
  return flat.filter((l) => (seen.has(l.href) ? false : (seen.add(l.href), true)))
}

export const findNavRoute = (href: string) => allNavRoutes().find((r) => r.href === href)

/** Routes that still show an "in preparation" page. Everything else is a real, CMS-driven page. */
const unbuiltPrefixes = ['/request-a-quote', '/privacy-policy', '/terms']
export function unbuiltRoutes(): NavLink[] {
  return allNavRoutes().filter((r) => unbuiltPrefixes.some((p) => r.href === p || r.href.startsWith(p + '/')))
}
