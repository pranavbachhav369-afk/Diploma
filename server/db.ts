import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  Course,
  Subcourse,
  Folder,
  PDFDocument,
  User,
  Admin,
  Order,
  Purchase,
  Coupon,
  Notification,
  Branch,
  Review,
  PDFPageContent
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getInitialClassplusData(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);
  const studentPasswordHash = bcrypt.hashSync('student123', salt);

  const branches: Branch[] = [
    { id: 'b_co', code: 'CO', name: 'Computer Engineering', icon: 'Laptop', is_active: true, order: 1 },
    { id: 'b_ce', code: 'CE', name: 'Civil Engineering', icon: 'HardHat', is_active: true, order: 2 },
    { id: 'b_me', code: 'ME', name: 'Mechanical Engineering', icon: 'Cog', is_active: true, order: 3 },
    { id: 'b_ee', code: 'EE', name: 'Electrical Engineering', icon: 'Zap', is_active: true, order: 4 },
    { id: 'b_ej', code: 'EJ', name: 'Electronics & Telecommunication', icon: 'Radio', is_active: true, order: 5 },
  ];

  // Helper pages for genuine MSBTE content
  const sampleSTEPages: PDFPageContent[] = [
    {
      page_number: 1,
      title: 'Unit 1: Introduction to Software Engineering & Classical Life Cycle Models',
      subtitle: 'MSBTE Course Code: 22517 (I-Scheme Curriculum)',
      content: `### 1.1 Definition & Importance of Software Engineering
Software engineering is the systematic, disciplined, and quantifiable approach to development, operation, and maintenance of software.

#### Classical Waterfall Model (MSBTE 4M & 6M Favorite):
1. Requirement Analysis & Specification (SRS)
2. System & Software Design
3. Implementation & Unit Testing
4. Integration & System Testing
5. Operation & Maintenance

*Advantage:* Simple to understand and implement. Ideal for small projects with frozen requirements.
*Disadvantage:* High risk when requirements change mid-project. Working model seen only late.`,
      highlights: ['Waterfall vs Spiral Model comparison is asked in almost every winter exam.', 'Always draw the 5-box waterfall lifecycle flow chart for full marks.'],
      formulas: ['Effort = a * (KLOC)^b [COCOMO Basic Formula]'],
      is_preview: true
    },
    {
      page_number: 2,
      title: 'Unit 1: Agile Framework, Scrum & Spiral Model',
      subtitle: 'Agile Manifesto & Sprint Cycle Mechanics',
      content: `### 1.2 Agile Methodology & Scrum
- **Sprint:** Fixed time-box of 2 to 4 weeks producing a shippable increment.
- **Product Backlog:** Prioritized list of functional features.
- **Sprint Retrospective:** Team inspects its process and agrees on improvements.

### 1.3 The Spiral Model (Risk-Driven Approach)
Proposed by Barry Boehm, combines prototyping with Waterfall. Four quadrants: Objective setting, Risk assessment, Development, and Review.`,
      highlights: ['Differentiate between Waterfall & Agile (MSBTE Summer 2023, 6 marks).'],
      formulas: [],
      is_preview: true
    },
    {
      page_number: 3,
      title: 'Unit 2: Software Requirements Engineering & SRS Format',
      subtitle: 'IEEE 830 Standard Specification',
      content: `### 2.1 Software Requirement Specification (SRS)
An SRS document is a formal contract between client and developer describing what software will do without specifying internal implementation.

#### Characteristics of a Good SRS:
1. Unambiguous
2. Complete
3. Verifiable
4. Consistent
5. Modifiable & Traceable`,
      highlights: ['IEEE 830 SRS structure is guaranteed for 6 marks in Section B.'],
      formulas: [],
      is_preview: false
    }
  ];

  const sampleCNPages: PDFPageContent[] = [
    {
      page_number: 1,
      title: 'Previous 5-Years MSBTE Solved Papers: Computer Network (22515)',
      subtitle: 'OSI Reference Model vs TCP/IP Protocol Suite',
      content: `### Q1(a) Differentiate between OSI and TCP/IP Model (4 Marks)
- **OSI Model:** 7 Layers, Theoretical reference, Strict protocol independence, developed by ISO.
- **TCP/IP Model:** 4 Layers (or 5), Practical implementation of Internet, protocols came first.

### Q1(b) State functions of Transport Layer in OSI Model:
1. Service-point (Port) addressing
2. Segmentation and reassembly
3. Connection control (TCP 3-way handshake)
4. Flow control and error control (Sliding window & Checksum)`,
      highlights: ['OSI 7 layer diagrams must include data units: Bits -> Frames -> Packets -> Segments.'],
      formulas: [],
      is_preview: true
    },
    {
      page_number: 2,
      title: 'IPv4 Subnetting & IP Addressing Solved Numericals',
      subtitle: 'Subnet Masks & Usable Host Calculations',
      content: `### Solved Problem: Given 192.168.10.0/26. Calculate:
1. Subnet Mask: 255.255.255.192
2. Number of Subnets: 2^2 = 4 subnets
3. Usable hosts per subnet: 2^6 - 2 = 62 hosts
4. 1st Subnet Range: 192.168.10.1 to 192.168.10.62 (Broadcast: 192.168.10.63)`,
      highlights: ['Subnetting numericals are guaranteed in Section B.'],
      formulas: ['Usable Hosts = 2^(32 - prefix) - 2'],
      is_preview: false
    }
  ];

  // 1. Initial Master Course
  const course1: Course = {
    id: 'crs_co_sem5',
    title: 'Computer Engineering 5th Semester Master Batch (All Subjects)',
    subtitle: 'Complete MSBTE I-Scheme Notes, 5-Year Solved Papers & Model Answers Pack',
    branch: 'Computer Engineering',
    semester: 5,
    year: '3rd Year',
    description: 'The ultimate Classplus-style diploma preparation course containing comprehensive handwritten notes, official MSBTE model answers, solved previous year papers, and VIP predicted questions for all 5th Semester subjects.',
    features: [
      'All 5 Subjects Covered (STE, AJP, CN, OS, DM)',
      '100% MSBTE I-Scheme Syllabus Aligned',
      'Previous 5-Year Question Papers with Solutions',
      'Step-by-Step Model Answers with Marking Scheme',
      'Personalized Student Watermark Secure PDF Reader',
      'Lifetime Access for MSBTE Winter & Summer Exams'
    ],
    price: 149,
    discount_price: 49,
    is_published: true,
    validity: 'Lifetime Access (Exam Pass Guaranteed)',
    thumbnail_color: 'from-blue-600 via-indigo-600 to-amber-500',
    enrolled_count: 1420,
    rating: 4.9,
    reviews_count: 184,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  };

  const course2: Course = {
    id: 'crs_ce_sem4',
    title: 'Civil Engineering 4th Semester Topper Package',
    subtitle: 'Theory of Structures, Geotechnical & Surveying Solved Manuals',
    branch: 'Civil Engineering',
    semester: 4,
    year: '2nd Year',
    description: 'Master all civil engineering concepts with step-by-step moment distribution calculations, fixed end moment tables, and soil mechanics diagrams.',
    features: [
      'TOS (22401) Solved Numericals',
      'Official MSBTE Step-by-Step Marking Scheme',
      'Formula Cheat Sheets & Derivations',
      'In-App Secure Reader with Zoom & Night Mode'
    ],
    price: 99,
    discount_price: 39,
    is_published: true,
    validity: '1 Year Access',
    thumbnail_color: 'from-amber-600 to-orange-700',
    enrolled_count: 650,
    rating: 4.8,
    reviews_count: 92,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    updated_at: new Date().toISOString()
  };

  // 2. Subcourses under Course 1
  const subcourses: Subcourse[] = [
    {
      id: 'sub_ste',
      course_id: 'crs_co_sem5',
      title: 'Software Engineering (STE - 22517)',
      subject_code: '22517',
      description: 'Software process models, Agile, Scrum, UML diagrams, SRS IEEE 830, testing metrics & CMM levels.',
      order: 1,
      price: 25,
      discount_price: 20,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_cn',
      course_id: 'crs_co_sem5',
      title: 'Computer Network (CN - 22515)',
      subject_code: '22515',
      description: 'OSI 7 Layers, TCP/IP, IPv4 Subnetting numericals, routing protocols, switches & network security.',
      order: 2,
      price: 25,
      discount_price: 15,
      is_published: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_ajp',
      course_id: 'crs_co_sem5',
      title: 'Advanced Java Programming (AJP - 22516)',
      subject_code: '22516',
      description: 'Java Swing, AWT hierarchy, Delegation Event Model, JDBC connectivity, Servlets & JSP.',
      order: 3,
      price: 25,
      discount_price: 20,
      is_published: true,
      created_at: new Date().toISOString()
    }
  ];

  // 3. Folders inside Subcourses
  const folders: Folder[] = [
    // Under Software Engineering
    {
      id: 'fld_ste_notes',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_ste',
      parent_folder_id: null,
      name: '📁 Unit-Wise Handwritten Notes (Topper Copy)',
      order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'fld_ste_pyq',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_ste',
      parent_folder_id: null,
      name: '📁 Previous 5-Years MSBTE Solved Question Papers',
      order: 2,
      created_at: new Date().toISOString()
    },
    {
      id: 'fld_ste_model',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_ste',
      parent_folder_id: null,
      name: '📁 Official MSBTE Model Answers with Marking Scheme',
      order: 3,
      created_at: new Date().toISOString()
    },

    // Under Computer Network
    {
      id: 'fld_cn_pyq',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_cn',
      parent_folder_id: null,
      name: '📁 5-Year Solved Question Papers & Subnetting Guide',
      order: 1,
      created_at: new Date().toISOString()
    },
    {
      id: 'fld_cn_notes',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_cn',
      parent_folder_id: null,
      name: '📁 Topper Quick Revision Summary Notes',
      order: 2,
      created_at: new Date().toISOString()
    }
  ];

  // 4. PDFs inside Folders
  const pdfs: PDFDocument[] = [
    {
      id: 'pdf_ste_unit1',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_ste',
      folder_id: 'fld_ste_notes',
      title: 'STE Unit 1 & 2: Process Models & Agile Scrum Complete Notes.pdf',
      description: 'Handwritten topper notes with neat pencil diagrams, Waterfall vs Spiral comparison, and IEEE 830 SRS template.',
      total_pages: 58,
      file_size: '4.8 MB',
      is_free_preview: true, // Free Preview for students
      price: 20,
      is_published: true,
      pages: sampleSTEPages,
      download_count: 1420,
      uploaded_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pdf_ste_pyq_solved',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_ste',
      folder_id: 'fld_ste_pyq',
      title: 'Software Engineering (22517) Winter & Summer 2019-2024 Solved Papers.pdf',
      description: 'Last 5 years board question paper solutions with question-wise marks breakdown.',
      total_pages: 72,
      file_size: '6.4 MB',
      is_free_preview: false,
      price: 15,
      is_published: true,
      pages: sampleSTEPages,
      download_count: 890,
      uploaded_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'pdf_cn_solved',
      course_id: 'crs_co_sem5',
      subcourse_id: 'sub_cn',
      folder_id: 'fld_cn_pyq',
      title: 'Computer Network (22515) 5 Years Solved Papers & Subnetting Numericals.pdf',
      description: 'Complete OSI 7 layer explanations, TCP 3-way handshake diagrams, and solved IPv4 subnetting numericals.',
      total_pages: 64,
      file_size: '5.2 MB',
      is_free_preview: true,
      price: 15,
      is_published: true,
      pages: sampleCNPages,
      download_count: 1120,
      uploaded_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const users: User[] = [
    {
      id: 'usr_student1',
      name: 'Rohan Deshmukh',
      email: 'student@diplomarankers.com',
      mobile: '+919876543210',
      password_hash: studentPasswordHash,
      branch: 'Computer Engineering',
      year: '3rd Year',
      semester: '5th Semester',
      is_active: true,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString()
    }
  ];

  const admins: Admin[] = [
    {
      id: 'adm_1',
      name: 'MSBTE Lead Administrator',
      email: 'admin@diplomarankers.com',
      password_hash: adminPasswordHash,
      role: 'superadmin',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString()
    }
  ];

  // Seed sample enrollment for demo student
  const orders: Order[] = [
    {
      id: 'ord_demo_101',
      order_number: 'DR-2025-9102',
      user_id: 'usr_student1',
      user_name: 'Rohan Deshmukh',
      user_email: 'student@diplomarankers.com',
      total_amount: 49,
      discount_amount: 0,
      final_amount: 49,
      payment_gateway: 'razorpay',
      razorpay_order_id: 'order_test_98129',
      razorpay_payment_id: 'pay_test_98129_succ',
      status: 'paid',
      items: [
        {
          id: 'item_101',
          order_id: 'ord_demo_101',
          item_type: 'course',
          item_id: 'crs_co_sem5',
          item_title: 'Computer Engineering 5th Semester Master Batch (All Subjects)',
          price: 49
        }
      ],
      created_at: new Date(Date.now() - 3 * 86400000).toISOString()
    }
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur_demo_1',
      user_id: 'usr_student1',
      item_type: 'course',
      item_id: 'crs_co_sem5',
      order_id: 'ord_demo_101',
      purchased_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      access_revoked: false
    }
  ];

  const coupons: Coupon[] = [
    {
      id: 'cp_ranker20',
      code: 'RANKER20',
      discount_percent: 20,
      min_order_value: 30,
      expiry_date: '2027-12-31',
      usage_limit: 1000,
      usage_count: 142,
      is_active: true
    },
    {
      id: 'cp_exam10',
      code: 'EXAM10',
      discount_fixed: 10,
      min_order_value: 20,
      expiry_date: '2027-12-31',
      usage_limit: 500,
      usage_count: 88,
      is_active: true
    }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif_1',
      title: 'MSBTE Winter Examination Timetable Released',
      message: 'Official diploma theory exam timetable has been released by MSBTE Board. Check your subject codes and start your revisions.',
      type: 'exam_alert',
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_active: true
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      course_id: 'crs_co_sem5',
      user_id: 'usr_student1',
      user_name: 'Rohan Deshmukh',
      user_branch: 'Computer Engineering',
      rating: 5,
      comment: 'Best diploma study course! The subcourse folders and solved model answers helped me score 89% in MSBTE board exams.',
      created_at: new Date().toISOString()
    }
  ];

  return {
    users,
    admins,
    branches,
    courses: [course1, course2],
    subcourses,
    folders,
    pdfs,
    orders,
    purchases,
    coupons,
    notifications,
    reviews
  };
}

class ClassplusDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        // Verify if it contains the Classplus courses structure
        if (parsed && Array.isArray(parsed.courses) && Array.isArray(parsed.pdfs)) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading db file, re-initializing Classplus seed data:', err);
    }
    const initial = getInitialClassplusData();
    this.save(initial);
    return initial;
  }

  public save(data?: DatabaseSchema) {
    if (data) {
      this.data = data;
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  // ==========================================
  // RESET / DELETE ALL (User Request: "the delete all the courses and pdf s")
  // ==========================================
  public deleteAllCoursesAndPDFs() {
    this.data.courses = [];
    this.data.subcourses = [];
    this.data.folders = [];
    this.data.pdfs = [];
    this.save();
    return { success: true, message: 'All courses, subcourses, folders, and PDFs have been wiped.' };
  }

  public resetToDefaultTemplate() {
    this.data = getInitialClassplusData();
    this.save();
    return { success: true, message: 'Classplus template course structure seeded successfully.' };
  }

  // User queries
  public getUsers(): User[] {
    return this.data.users.map(u => ({ ...u, password_hash: '' }));
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User): User {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return undefined;
  }

  public grantStudentAccess(userId: string, itemType: 'course' | 'subcourse' | 'pdf', itemId: string): Purchase {
    const existing = this.data.purchases.find(
      p => p.user_id === userId && p.item_id === itemId
    );
    if (existing) {
      existing.access_revoked = false;
      this.save();
      return existing;
    }

    const newPurchase: Purchase = {
      id: `pur_admin_grant_${Date.now()}`,
      user_id: userId,
      item_type: itemType,
      item_id: itemId,
      order_id: `adm_grant_${Date.now()}`,
      purchased_at: new Date().toISOString(),
      access_revoked: false
    };

    this.data.purchases.push(newPurchase);
    if (itemType === 'course') {
      const crs = this.findCourseById(itemId);
      if (crs) crs.enrolled_count = (crs.enrolled_count || 0) + 1;
    }
    this.save();
    return newPurchase;
  }

  public revokeStudentAccess(userId: string, itemId: string): boolean {
    const purchase = this.data.purchases.find(
      p => p.user_id === userId && p.item_id === itemId && !p.access_revoked
    );
    if (purchase) {
      purchase.access_revoked = true;
      this.save();
      return true;
    }
    return false;
  }

  // Admin queries
  public findAdminByEmail(email: string): Admin | undefined {
    return this.data.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  public findAdminById(id: string): Admin | undefined {
    return this.data.admins.find(a => a.id === id);
  }

  // Branches
  public getBranches(): Branch[] {
    return this.data.branches;
  }

  // ==========================================
  // COURSES (CRUD)
  // ==========================================
  public getCourses(includeUnpublished = false): Course[] {
    if (includeUnpublished) return this.data.courses;
    return this.data.courses.filter(c => c.is_published);
  }

  public findCourseById(id: string): Course | undefined {
    return this.data.courses.find(c => c.id === id);
  }

  public createCourse(course: Course): Course {
    this.data.courses.unshift(course);
    this.save();
    return course;
  }

  public updateCourse(id: string, updates: Partial<Course>): Course | undefined {
    const idx = this.data.courses.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.courses[idx] = {
        ...this.data.courses[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.courses[idx];
    }
    return undefined;
  }

  public deleteCourse(id: string): boolean {
    const initLen = this.data.courses.length;
    this.data.courses = this.data.courses.filter(c => c.id !== id);
    // Also remove associated subcourses, folders, pdfs
    this.data.subcourses = this.data.subcourses.filter(s => s.course_id !== id);
    this.data.folders = this.data.folders.filter(f => f.course_id !== id);
    this.data.pdfs = this.data.pdfs.filter(p => p.course_id !== id);
    if (this.data.courses.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // SUBCOURSES (CRUD)
  // ==========================================
  public getSubcourses(courseId?: string): Subcourse[] {
    if (courseId) {
      return this.data.subcourses.filter(s => s.course_id === courseId);
    }
    return this.data.subcourses;
  }

  public findSubcourseById(id: string): Subcourse | undefined {
    return this.data.subcourses.find(s => s.id === id);
  }

  public createSubcourse(subcourse: Subcourse): Subcourse {
    this.data.subcourses.push(subcourse);
    this.save();
    return subcourse;
  }

  public updateSubcourse(id: string, updates: Partial<Subcourse>): Subcourse | undefined {
    const idx = this.data.subcourses.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.subcourses[idx] = { ...this.data.subcourses[idx], ...updates };
      this.save();
      return this.data.subcourses[idx];
    }
    return undefined;
  }

  public deleteSubcourse(id: string): boolean {
    const initLen = this.data.subcourses.length;
    this.data.subcourses = this.data.subcourses.filter(s => s.id !== id);
    // Remove folders and pdfs in this subcourse
    this.data.folders = this.data.folders.filter(f => f.subcourse_id !== id);
    this.data.pdfs = this.data.pdfs.filter(p => p.subcourse_id !== id);
    if (this.data.subcourses.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // FOLDERS (CRUD)
  // ==========================================
  public getFolders(courseId?: string, subcourseId?: string): Folder[] {
    let list = this.data.folders;
    if (courseId) list = list.filter(f => f.course_id === courseId);
    if (subcourseId) list = list.filter(f => f.subcourse_id === subcourseId);
    return list;
  }

  public findFolderById(id: string): Folder | undefined {
    return this.data.folders.find(f => f.id === id);
  }

  public createFolder(folder: Folder): Folder {
    this.data.folders.push(folder);
    this.save();
    return folder;
  }

  public updateFolder(id: string, updates: Partial<Folder>): Folder | undefined {
    const idx = this.data.folders.findIndex(f => f.id === id);
    if (idx !== -1) {
      this.data.folders[idx] = { ...this.data.folders[idx], ...updates };
      this.save();
      return this.data.folders[idx];
    }
    return undefined;
  }

  public deleteFolder(id: string): boolean {
    const initLen = this.data.folders.length;
    this.data.folders = this.data.folders.filter(f => f.id !== id && f.parent_folder_id !== id);
    // Remove pdfs in this folder
    this.data.pdfs = this.data.pdfs.filter(p => p.folder_id !== id);
    if (this.data.folders.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // PDF DOCUMENTS (CRUD)
  // ==========================================
  public getPDFs(folderId?: string, courseId?: string): PDFDocument[] {
    let list = this.data.pdfs;
    if (folderId) list = list.filter(p => p.folder_id === folderId);
    if (courseId) list = list.filter(p => p.course_id === courseId);
    return list;
  }

  public findPDFById(id: string): PDFDocument | undefined {
    return this.data.pdfs.find(p => p.id === id);
  }

  public createPDF(pdf: PDFDocument): PDFDocument {
    this.data.pdfs.unshift(pdf);
    this.save();
    return pdf;
  }

  public updatePDF(id: string, updates: Partial<PDFDocument>): PDFDocument | undefined {
    const idx = this.data.pdfs.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.pdfs[idx] = {
        ...this.data.pdfs[idx],
        ...updates,
        updated_at: new Date().toISOString()
      };
      this.save();
      return this.data.pdfs[idx];
    }
    return undefined;
  }

  public deletePDF(id: string): boolean {
    const initLen = this.data.pdfs.length;
    this.data.pdfs = this.data.pdfs.filter(p => p.id !== id);
    if (this.data.pdfs.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ==========================================
  // ACCESS & PURCHASE CHECKS (Classplus Model)
  // ==========================================
  public hasUserAccessToPDF(userId: string, pdfId: string): boolean {
    const pdf = this.findPDFById(pdfId);
    if (!pdf) return false;

    // 1. If PDF is flagged as Free Preview, everyone can access
    if (pdf.is_free_preview) return true;

    // 2. Direct purchase of PDF
    const directPurchase = this.data.purchases.some(
      p => p.user_id === userId && p.item_id === pdfId && !p.access_revoked
    );
    if (directPurchase) return true;

    // 3. Purchase of parent Course (grants access to all subcourses, folders & PDFs inside!)
    const coursePurchase = this.data.purchases.some(
      p => p.user_id === userId && p.item_id === pdf.course_id && !p.access_revoked
    );
    if (coursePurchase) return true;

    // 4. Purchase of Subcourse
    const subcoursePurchase = this.data.purchases.some(
      p => p.user_id === userId && p.item_id === pdf.subcourse_id && !p.access_revoked
    );
    if (subcoursePurchase) return true;

    return false;
  }

  public hasUserAccessToCourse(userId: string, courseId: string): boolean {
    return this.data.purchases.some(
      p => p.user_id === userId && p.item_id === courseId && !p.access_revoked
    );
  }

  public getPurchasesByUserId(userId: string): Purchase[] {
    return this.data.purchases.filter(p => p.user_id === userId && !p.access_revoked);
  }

  public recordPurchase(purchase: Purchase): Purchase {
    const exists = this.data.purchases.some(
      p => p.user_id === purchase.user_id && p.item_id === purchase.item_id
    );
    if (!exists) {
      this.data.purchases.push(purchase);
      // Increment enroll count if course
      const crs = this.findCourseById(purchase.item_id);
      if (crs) {
        crs.enrolled_count = (crs.enrolled_count || 0) + 1;
      }
      this.save();
    }
    return purchase;
  }

  // ==========================================
  // ORDERS
  // ==========================================
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public findOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | undefined {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.save();
      return this.data.orders[idx];
    }
    return undefined;
  }

  // Coupons
  public findCouponByCode(code: string): Coupon | undefined {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  // Notifications
  public getNotifications(onlyActive = true): Notification[] {
    if (onlyActive) return this.data.notifications.filter(n => n.is_active);
    return this.data.notifications;
  }

  public createNotification(notif: Notification): Notification {
    this.data.notifications.unshift(notif);
    this.save();
    return notif;
  }

  public deleteNotification(id: string): boolean {
    const initLen = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => n.id !== id);
    if (this.data.notifications.length !== initLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Reviews
  public getReviews(courseId?: string): Review[] {
    if (courseId) {
      return this.data.reviews.filter(r => r.course_id === courseId);
    }
    return this.data.reviews;
  }

  public addReview(review: Review): Review {
    this.data.reviews.unshift(review);
    const crsReviews = this.data.reviews.filter(r => r.course_id === review.course_id);
    const avg = crsReviews.reduce((sum, r) => sum + r.rating, 0) / crsReviews.length;
    const crs = this.findCourseById(review.course_id);
    if (crs) {
      crs.rating = Math.round(avg * 10) / 10;
      crs.reviews_count = crsReviews.length;
    }
    this.save();
    return review;
  }
}

export const db = new ClassplusDatabase();
