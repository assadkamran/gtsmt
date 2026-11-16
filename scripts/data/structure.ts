/**
 * Starter structure and copy for the catalogue, solutions and industries.
 * Copy here is generic technical description only. It makes no claims about GTSMT's
 * services, capacity, certifications, stock or shipping. Everything seeds as "unreviewed"
 * (hidden from search engines) until the owner ticks "Reviewed" in the CMS.
 */

export type Division = 'equipment' | 'parts' | 'peripherals'
export type Station = 'loader' | 'printer' | 'spi' | 'placer' | 'reflow' | 'aoi' | 'unloader'

export type CategorySeed = {
  slug: string
  name: string
  division: Division
  parent?: string
  sortOrder: number
  lineStation?: Station
  summary: string
  description?: string[]
}

export const categories: CategorySeed[] = [
  // ---------- Equipment (listed in production-line order) ----------
  { slug: 'solder-paste-printers', name: 'Solder Paste Printers', division: 'equipment', sortOrder: 10, lineStation: 'printer',
    summary: 'Solder paste printers deposit solder paste onto the pads of a bare board through a stencil. It is the first process step in most SMT lines.',
    description: ['Print quality has a strong influence on soldering results further down the line, so the printer is normally specified together with stencil handling and paste inspection.', 'When comparing printers, the points to check are the range of board sizes, how boards are supported and clamped, the stencil frame size, and whether the printer can be linked to solder paste inspection.'] },
  { slug: 'spi-solder-paste-inspection', name: 'Solder Paste Inspection (SPI)', division: 'equipment', sortOrder: 20, lineStation: 'spi',
    summary: 'Solder paste inspection (SPI) machines measure the paste deposited by the printer, so print defects are found before any components are placed.',
    description: ['Inspection systems may be two-dimensional or three-dimensional. Three-dimensional systems measure the height and volume of each paste deposit as well as its position.', 'SPI is often placed directly after the printer, so the results can be used to adjust the printing process.'] },
  { slug: 'pick-and-place-machines', name: 'Pick and Place Machines', division: 'equipment', sortOrder: 30, lineStation: 'placer',
    summary: 'Pick and place machines take components from feeders and place them onto the printed board at programmed positions.',
    description: ['Machines differ in placement speed, placement accuracy, the range of component sizes they handle, and how many feeders they hold.', 'High-speed machines are generally suited to small, standard components in volume, while flexible multi-function machines cover a wider range of component types. The right choice depends on your boards and your production volume.'] },
  { slug: 'reflow-soldering-ovens', name: 'Reflow Soldering Ovens', division: 'equipment', sortOrder: 40, lineStation: 'reflow',
    summary: 'Reflow soldering ovens heat the assembled board through a controlled temperature profile, so the solder paste melts and forms the solder joints.',
    description: ['Ovens are usually compared by the number of heating zones, the board width they accept, the type of conveyor, and whether they can run with a nitrogen atmosphere.', 'The temperature profile needs to suit both the solder paste and the components on the board.'] },
  { slug: 'wave-soldering-machines', name: 'Wave Soldering Machines', division: 'equipment', sortOrder: 50,
    summary: 'Wave soldering machines solder through-hole components, and some mixed-technology boards, by passing the underside of the board over a wave of molten solder.',
    description: ['Wave soldering is typically used where a board carries through-hole components, either on its own or alongside surface-mount parts.', 'Tell us about your board and component mix and we can discuss whether wave soldering suits your process.'] },
  { slug: 'aoi-automated-optical-inspection', name: 'Automated Optical Inspection (AOI)', division: 'equipment', sortOrder: 60, lineStation: 'aoi',
    summary: 'Automated optical inspection (AOI) systems use cameras to check boards for missing, misplaced or poorly soldered components.',
    description: ['AOI can be placed after component placement, after reflow, or both. Each position catches different kinds of defects.', 'Systems differ in camera resolution, board size range, programming effort and how defects are reported to the operator.'] },
  { slug: 'pcb-loaders', name: 'PCB Loaders', division: 'equipment', sortOrder: 70, lineStation: 'loader',
    summary: 'PCB loaders feed bare boards into the line automatically from magazines or stacks.',
    description: ['A loader keeps the first machine in the line supplied without manual handling. Check the range of board sizes, the magazine type, and the connection to the next machine.'] },
  { slug: 'pcb-unloaders', name: 'PCB Unloaders', division: 'equipment', sortOrder: 80, lineStation: 'unloader',
    summary: 'PCB unloaders collect finished boards at the end of the line into magazines or onto a conveyor.',
    description: ['Unloaders may stack boards, fill magazines, or sort boards by inspection result. Check the board size range and how the unloader connects to the machine before it.'] },
  { slug: 'pcb-conveyors', name: 'PCB Conveyors', division: 'equipment', sortOrder: 90,
    summary: 'PCB conveyors link machines in a line, and can buffer boards between process steps or change their direction and height.',
    description: ['Conveyors are specified by length and board width range. Variants include inspection conveyors with a working area, turn conveyors and lift conveyors.'] },
  { slug: 'pcb-depaneling-machines', name: 'PCB Depaneling Machines', division: 'equipment', sortOrder: 100,
    summary: 'Depaneling machines separate individual boards from a larger panel after assembly, by routing, scoring or cutting.',
    description: ['The method depends on how the panel is built and what the boards carry. Tell us your board and panel details.'] },
  { slug: 'pcb-cleaning-equipment', name: 'PCB Cleaning Equipment', division: 'equipment', sortOrder: 110,
    summary: 'PCB cleaning equipment removes flux residues and other contamination from assembled boards.',
    description: ['Whether cleaning is needed depends on the product and the flux used. Tell us your process and board type.'] },
  { slug: 'pcb-storage-and-buffer-systems', name: 'PCB Storage and Buffer Systems', division: 'equipment', sortOrder: 120,
    summary: 'Storage and buffer systems hold boards between process steps, so the line keeps running smoothly.',
    description: ['Buffers absorb differences in cycle time between machines, and storage systems keep boards in order between processes.'] },
  { slug: 'other-smt-equipment', name: 'Other SMT Equipment', division: 'equipment', sortOrder: 130,
    summary: 'Other SMT manufacturing equipment that does not fit the categories above.',
    description: ['If you are looking for equipment that is not listed, send us what you need and we will reply.'] },

  // ---------- Peripherals ----------
  { slug: 'magazine-loaders', name: 'Magazine Loaders', division: 'peripherals', sortOrder: 10,
    summary: 'Magazine loaders feed boards from magazines into the line.',
    description: ['Magazine loaders hold boards in magazines and feed them one by one into the line. Check the magazine size they accept and the range of board sizes.'] },
  { slug: 'magazine-unloaders', name: 'Magazine Unloaders', division: 'peripherals', sortOrder: 20,
    summary: 'Magazine unloaders collect finished boards into magazines at the end of the line.',
    description: ['Magazine unloaders fill magazines with finished boards as they leave the line. Check the magazine size and the range of board sizes.'] },
  { slug: 'pcb-conveyors', name: 'PCB Conveyors', division: 'peripherals', sortOrder: 30,
    summary: 'PCB conveyors link machines in the line and carry boards between them.',
    description: ['Conveyors are specified by length and board width range, and must connect cleanly to the machines either side.'] },
  { slug: 'inspection-conveyors', name: 'Inspection Conveyors', division: 'peripherals', sortOrder: 40,
    summary: 'Inspection conveyors give operators a working area to check or rework boards between machines.',
    description: ['An inspection conveyor holds the board at a comfortable working position. Check the board size range and the working area.'] },
  { slug: 'ng-ok-buffer-systems', name: 'NG/OK Buffer Systems', division: 'peripherals', sortOrder: 50,
    summary: 'NG/OK buffer systems separate boards that passed inspection from boards that did not, usually after AOI.',
    description: ['A buffer system sorts boards by inspection result so that failed boards can be reviewed without stopping the line.'] },
  { slug: 'pcb-turn-conveyors', name: 'PCB Turn Conveyors', division: 'peripherals', sortOrder: 60,
    summary: 'PCB turn conveyors change the direction of board flow, for example by 90 degrees, so a line fits the available floor space.',
    description: ['Turn conveyors are used where the line needs to change direction. Check the board size range and the connection at each end.'] },
  { slug: 'pcb-lift-conveyors', name: 'PCB Lift Conveyors', division: 'peripherals', sortOrder: 70,
    summary: 'PCB lift conveyors change the height of the board path, for example to move boards between levels.',
    description: ['Lift conveyors raise or lower boards between two heights in the line. Check the height change and the board size range.'] },
  { slug: 'esd-equipment', name: 'ESD Equipment', division: 'peripherals', sortOrder: 80,
    summary: 'ESD equipment protects static-sensitive components and boards during handling and storage.',
    description: ['Electrostatic discharge protection covers the factory floor, workstations and storage. Tell us what you need to protect.'] },
  { slug: 'production-line-accessories', name: 'Production-Line Accessories', division: 'peripherals', sortOrder: 90,
    summary: 'Accessories that support the day-to-day operation of an SMT line.',
    description: ['Tell us the machines you run and what you need, and we will reply.'] },
  { slug: 'other-factory-peripherals', name: 'Other Factory Peripherals', division: 'peripherals', sortOrder: 100,
    summary: 'Other factory peripherals for SMT production.',
    description: ['If you are looking for something that is not listed, send us what you need and we will reply.'] },

  // ---------- Spare parts ----------
  { slug: 'feeders', name: 'Feeders', division: 'parts', sortOrder: 10,
    summary: 'Feeders present components to the pick and place machine in the right position for picking. The right feeder depends on the machine model, the packaging and the tape width.',
    description: ['Feeders are chosen by feed format (tape, tray or stick), by drive type, and by compatibility with your machine model. Compatibility is shown on a listing only when it has been verified.'] },
  { slug: 'tape-feeders', name: 'Tape Feeders', division: 'parts', parent: 'feeders', sortOrder: 10,
    summary: 'Tape feeders supply components packed on carrier tape, which is the most common packaging in SMT.',
    description: ['Tape feeders are matched to the machine model and to the width of the tape. Send us the machine model and the tape width.'] },
  { slug: 'electric-feeders', name: 'Electric Feeders', division: 'parts', parent: 'feeders', sortOrder: 20,
    summary: 'Electric feeders use an electric drive to advance the component tape.',
    description: ['Electric feeders are matched to the machine model. Send us the machine model and the part number if you have it.'] },
  { slug: 'pneumatic-feeders', name: 'Pneumatic Feeders', division: 'parts', parent: 'feeders', sortOrder: 30,
    summary: 'Pneumatic feeders use air pressure to advance the component tape.',
    description: ['Pneumatic feeders are matched to the machine model. Send us the machine model and the part number if you have it.'] },
  { slug: 'tray-feeders', name: 'Tray Feeders', division: 'parts', parent: 'feeders', sortOrder: 40,
    summary: 'Tray feeders hold matrix trays of components, typically ICs and larger or irregular parts.',
    description: ['Tray feeders are matched to the machine model and the tray size. Send us the machine model and the tray details.'] },
  { slug: 'stick-feeders', name: 'Stick Feeders', division: 'parts', parent: 'feeders', sortOrder: 50,
    summary: 'Stick feeders supply components packed in tubes or sticks.',
    description: ['Stick feeders are matched to the machine model. Send us the machine model and the component packaging.'] },
  { slug: 'feeder-carts', name: 'Feeder Carts', division: 'parts', parent: 'feeders', sortOrder: 60,
    summary: 'Feeder carts hold a set of feeders, so a product changeover can be prepared away from the machine.',
    description: ['Feeder carts are matched to the machine model. Send us the machine model.'] },
  { slug: 'feeder-accessories', name: 'Feeder Accessories', division: 'parts', parent: 'feeders', sortOrder: 70,
    summary: 'Accessories for feeders, such as carts, tape cutters and calibration tools.',
    description: ['Tell us the feeders you run and what you need.'] },
  { slug: 'nozzles', name: 'Pick and Place Nozzles', division: 'parts', sortOrder: 20,
    summary: 'Nozzles pick components from the feeder and hold them while the machine places them. The right nozzle depends on the machine model and on the size and shape of the component.',
    description: ['Send us the machine model and the component you need to place, and the nozzle part number if you have it.'] },
  { slug: 'motors', name: 'Motors', division: 'parts', sortOrder: 30,
    summary: 'Replacement motors for pick and place machines and other SMT equipment.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'belts', name: 'Belts', division: 'parts', sortOrder: 40,
    summary: 'Replacement belts for SMT machines and conveyors.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'sensors', name: 'Sensors', division: 'parts', sortOrder: 50,
    summary: 'Replacement sensors for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'valves', name: 'Valves', division: 'parts', sortOrder: 60,
    summary: 'Replacement valves for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'filters', name: 'Filters', division: 'parts', sortOrder: 70,
    summary: 'Replacement filters for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'cameras', name: 'Cameras', division: 'parts', sortOrder: 80,
    summary: 'Replacement cameras and vision components for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'electronic-boards', name: 'Electronic Boards', division: 'parts', sortOrder: 90,
    summary: 'Replacement electronic boards for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'cables', name: 'Cables', division: 'parts', sortOrder: 100,
    summary: 'Replacement cables and harnesses for SMT machines.',
    description: ['Send us the machine model and the part number so compatibility can be confirmed.'] },
  { slug: 'other-replacement-components', name: 'Other Replacement Components', division: 'parts', sortOrder: 110,
    summary: 'Other replacement components for SMT machines.',
    description: ['Send us the part number or your machine model and we will reply.'] },
]

// ---------------------------------------------------------------------------------------------

export type StationSeed = { station: string; category: string; optional?: boolean; note: string }

const N = {
  loader: 'Feeds bare boards into the line from magazines or stacks, so the line stays supplied without manual handling.',
  printer: 'Deposits solder paste onto the pads through a stencil. Print quality strongly influences defect rates further down the line.',
  spi: 'Measures the printed paste so defects are caught before any components are placed.',
  placer: 'Places components onto the printed board, fed from tape, tray or stick feeders.',
  reflow: 'Heats the assembly through a controlled temperature profile to form the solder joints.',
  aoi: 'Inspects soldered boards for placement and solder defects.',
  unloader: 'Collects finished boards into magazines or onto a conveyor for the next process.',
}

function line(over: Partial<Record<keyof typeof N, string>> = {}): StationSeed[] {
  const n = { ...N, ...over }
  return [
    { station: 'Loader', category: 'pcb-loaders', note: n.loader },
    { station: 'Printer', category: 'solder-paste-printers', note: n.printer },
    { station: 'SPI', category: 'spi-solder-paste-inspection', optional: true, note: n.spi },
    { station: 'Pick and place', category: 'pick-and-place-machines', note: n.placer },
    { station: 'Reflow', category: 'reflow-soldering-ovens', note: n.reflow },
    { station: 'AOI', category: 'aoi-automated-optical-inspection', optional: true, note: n.aoi },
    { station: 'Unloader', category: 'pcb-unloaders', note: n.unloader },
  ]
}

export type SolutionSeed = { slug: string; title: string; summary: string; body: string[]; stations: StationSeed[] }

export const solutions: SolutionSeed[] = [
  { slug: 'complete-smt-production-lines', title: 'Complete SMT Production Lines',
    summary: 'A complete SMT line takes bare boards through paste printing, component placement, soldering and inspection in one continuous flow.',
    body: ['A typical line starts with a loader, then a solder paste printer, optional paste inspection, one or more pick and place machines, a reflow oven, optional automated optical inspection, and an unloader. Conveyors and buffers connect the stations.', 'The right configuration depends on your boards, your production volume and your product mix. Send us your answers to the questions below and we will respond with a proposal for each station.'],
    stations: line() },
  { slug: 'turnkey-pcb-assembly-lines', title: 'Turnkey PCB Assembly Lines',
    summary: 'A turnkey line is specified and supplied as one package, covering every station from board loading to unloading.',
    body: ['With a turnkey approach the equipment for each station is chosen together, so the machines work as one line rather than as separate purchases.', 'Tell us your product, your volume, and whether this is a new factory or an addition to an existing one. We will respond with a proposal.'],
    stations: line() },
  { slug: 'led-smt-production-lines', title: 'LED SMT Production Lines',
    summary: 'Lines for assembling LED lighting and display boards, which can differ from standard boards in length, material and handling.',
    body: ['LED boards range from small modules to long strips, and are often made on metal-core materials. Board length, thickness and support need to be checked at every station.', 'Tell us your board dimensions and the LED packages you place, and we will respond with a suitable configuration.'],
    stations: line({
      loader: 'Feeds bare boards into the line. Check the maximum board length the loader accepts.',
      printer: 'Deposits solder paste through a stencil. Confirm the printer supports your board length and thickness.',
      placer: 'Places components onto the printed board. Confirm the machine’s board-length limit and its support for your LED packages.',
      reflow: 'Heats the assembly through a controlled temperature profile. Confirm the oven accepts your board length and width.',
    }) },
  { slug: 'high-speed-smt-production-lines', title: 'High-Speed SMT Production Lines',
    summary: 'Lines configured around placement throughput, for high-volume production of standard boards.',
    body: ['High-volume lines usually use several placement machines in sequence, so that feeding and placement work is shared across the line and no single machine limits output.', 'Throughput depends on the number of components per board and the mix of component types. Tell us your volume and board details and we will respond with a configuration.'],
    stations: line({ placer: 'Places components onto the printed board. High-volume lines often use more than one machine, sharing the placement work between them.' }) },
  { slug: 'flexible-smt-production-lines', title: 'Flexible SMT Production Lines',
    summary: 'Lines configured for frequent product changeovers and a wide range of board and component types.',
    body: ['High-mix production needs quick changeovers between products. Feeder carts that are prepared away from the machine, flexible placement machines, and straightforward conveyor adjustment all help.', 'Tell us how many different products you build and how often you change over, and we will respond with a configuration.'],
    stations: line({ placer: 'Places components onto the printed board. Flexible machines handle a wider range of components, and feeder carts can be prepared before a changeover.' }) },
  { slug: 'smt-factory-setup', title: 'SMT Factory Setup',
    summary: 'Planning a new SMT facility, from the line itself to the equipment and material handling around it.',
    body: ['A new SMT facility involves more than the line: floor layout, material storage, board handling between processes and ESD protection all need planning.', 'Tell us what you intend to build and how much space you have, and we will respond with a proposal.'],
    stations: line() },
  { slug: 'customized-smt-solutions', title: 'Customized SMT Solutions',
    summary: 'Production solutions configured around your product, your process and your existing equipment.',
    body: ['If your requirements do not fit a standard line, tell us what you need to build. A custom configuration can combine new equipment with machines you already run.', 'Send us your board details, your existing equipment and what you want to change.'],
    stations: line() },
]

// ---------------------------------------------------------------------------------------------

export type IndustrySeed = { slug: string; title: string; intro: string; body: string[]; requirements: string[]; solutions: string[]; categories: string[] }

export const industries: IndustrySeed[] = [
  { slug: 'automotive-electronics', title: 'Automotive Electronics',
    intro: 'Control units, sensors, lighting and infotainment boards for vehicles.',
    body: ['Automotive electronics covers a wide range of boards, from engine and body control units to lighting, sensors and infotainment. Volumes are often high and product programmes run for years.', 'Buyers in this sector commonly specify tight process control, inspection coverage and traceability through production. These requirements shape the choice of printers, placement machines and inspection equipment.'],
    requirements: ['Consistent process control', 'Inspection coverage after printing and soldering', 'Traceability of boards and materials', 'Capacity that can scale with programme volumes'],
    solutions: ['complete-smt-production-lines', 'high-speed-smt-production-lines', 'flexible-smt-production-lines'],
    categories: ['solder-paste-printers', 'spi-solder-paste-inspection', 'pick-and-place-machines', 'reflow-soldering-ovens', 'aoi-automated-optical-inspection'] },
  { slug: 'consumer-electronics', title: 'Consumer Electronics',
    intro: 'Phones, wearables, appliances and other products built in volume with short product cycles.',
    body: ['Consumer electronics is typically high-volume, with short product lifecycles and small, densely populated boards.', 'Lines need good placement throughput, fine-pitch capability and quick changeovers between product variants.'],
    requirements: ['High placement throughput', 'Fine-pitch and small component capability', 'Quick changeover between product variants'],
    solutions: ['high-speed-smt-production-lines', 'flexible-smt-production-lines', 'complete-smt-production-lines'],
    categories: ['pick-and-place-machines', 'solder-paste-printers', 'reflow-soldering-ovens', 'aoi-automated-optical-inspection'] },
  { slug: 'led-manufacturing', title: 'LED Manufacturing',
    intro: 'LED lighting and display modules, from small boards to long strips.',
    body: ['LED boards can be long, thin or built on metal-core materials, which affects how they are handled in a line.', 'Board length and support need to be checked at every station: loader, printer, placement machine, oven and unloader.'],
    requirements: ['Handling of long and thin boards', 'Support for metal-core boards where used', 'Placement of LED packages'],
    solutions: ['led-smt-production-lines', 'complete-smt-production-lines', 'high-speed-smt-production-lines'],
    categories: ['pcb-loaders', 'solder-paste-printers', 'pick-and-place-machines', 'reflow-soldering-ovens', 'pcb-unloaders'] },
  { slug: 'medical-electronics', title: 'Medical Electronics',
    intro: 'Electronics for medical devices, where documentation and process control are central.',
    body: ['Medical device electronics often combines lower volumes with demanding documentation and process-control expectations set by regulators and customers.', 'Buyers in this sector typically look for stable processes, inspection coverage and records that support traceability.'],
    requirements: ['Stable, repeatable processes', 'Inspection coverage', 'Records that support traceability'],
    solutions: ['flexible-smt-production-lines', 'complete-smt-production-lines', 'customized-smt-solutions'],
    categories: ['solder-paste-printers', 'spi-solder-paste-inspection', 'pick-and-place-machines', 'aoi-automated-optical-inspection'] },
  { slug: 'industrial-electronics', title: 'Industrial Electronics',
    intro: 'Controllers, drives, instrumentation and other equipment built for long service lives.',
    body: ['Industrial electronics is often built in mixed volumes, with long product lifetimes and a wide variety of board designs.', 'Flexibility, and the ability to keep building existing products for many years, matter as much as speed.'],
    requirements: ['Flexibility across many board designs', 'Ability to build existing products over many years', 'Mixed SMT and through-hole assembly'],
    solutions: ['flexible-smt-production-lines', 'customized-smt-solutions', 'complete-smt-production-lines'],
    categories: ['pick-and-place-machines', 'reflow-soldering-ovens', 'wave-soldering-machines'] },
  { slug: 'power-electronics', title: 'Power Electronics',
    intro: 'Power supplies, inverters and chargers, often with larger components and heavier copper.',
    body: ['Power electronics boards frequently carry larger components, heavier copper, and a mix of surface-mount and through-hole parts.', 'Placement machines need to handle larger components, and wave soldering may be needed alongside reflow.'],
    requirements: ['Handling of larger, heavier components', 'Support for mixed-technology boards', 'Soldering suited to heavier copper'],
    solutions: ['customized-smt-solutions', 'flexible-smt-production-lines', 'complete-smt-production-lines'],
    categories: ['pick-and-place-machines', 'reflow-soldering-ovens', 'wave-soldering-machines'] },
  { slug: 'telecommunications', title: 'Telecommunications',
    intro: 'Network, radio and communications equipment, often with dense boards and fine-pitch components.',
    body: ['Telecommunications boards are often dense, with many layers and fine-pitch components.', 'Placement accuracy, paste printing quality and inspection coverage are therefore important.'],
    requirements: ['Placement accuracy for fine-pitch components', 'Paste printing quality', 'Inspection coverage'],
    solutions: ['complete-smt-production-lines', 'high-speed-smt-production-lines', 'customized-smt-solutions'],
    categories: ['solder-paste-printers', 'spi-solder-paste-inspection', 'pick-and-place-machines', 'aoi-automated-optical-inspection'] },
  { slug: 'ems-and-contract-manufacturing', title: 'EMS and Contract Manufacturing',
    intro: 'Contract manufacturers building many customers’ products on shared lines.',
    body: ['EMS providers build many different products, so lines have to change over quickly and handle a wide range of boards and components.', 'Equipment flexibility, quick changeover, and the ability to add capacity as work grows are usually the main considerations.'],
    requirements: ['Quick changeovers between products', 'A wide range of board and component types', 'Capacity that can grow with new customers'],
    solutions: ['flexible-smt-production-lines', 'complete-smt-production-lines', 'smt-factory-setup'],
    categories: ['pick-and-place-machines', 'pcb-conveyors', 'pcb-storage-and-buffer-systems'] },
]
