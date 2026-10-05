import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './server/db';
import {
  authenticateToken,
  requireAdmin,
  optionalAuth,
  hashPassword,
  comparePassword,
  generateToken,
  AuthRequest
} from './server/auth';
import {
  createRazorpayOrderReference,
  verifyPaymentSignature,
  generatePaymentSignature
} from './server/payment';
import { Course, Subcourse, Folder, PDFDocument, Order, Purchase, User, Coupon, Notification, Review } from './server/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// ==========================================
// 1. AUTHENTICATION (Student & Admin)
// ==========================================

app.post('/api/auth/student/register', (req: Request, res: Response) => {
  const { name, email, mobile, password, branch, year, semester } = req.body;

  if (!name || !email || !mobile || !password || !branch || !year || !semester) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'An account with this email address already exists.' });
  }

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    mobile: mobile.trim(),
    password_hash: hashPassword(password),
    branch,
    year,
    semester,
    is_active: true,
    created_at: new Date().toISOString()
  };

  db.createUser(newUser);

  const token = generateToken({
    id: newUser.id,
    email: newUser.email,
    role: 'student',
    name: newUser.name
  });

  return res.status(201).json({
    message: 'Registration successful! Welcome to Diploma Rankers.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      mobile: newUser.mobile,
      branch: newUser.branch,
      year: newUser.year,
      semester: newUser.semester
    }
  });
});

app.post('/api/auth/student/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'No account found with this email address.' });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: 'Account has been deactivated. Please contact administrator.' });
  }

  const isValid = comparePassword(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: 'student',
    name: user.name
  });

  return res.json({
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      branch: user.branch,
      year: user.year,
      semester: user.semester
    }
  });
});

app.get('/api/auth/student/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = db.findUserById(req.user!.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const purchases = db.getPurchasesByUserId(user.id);
  return res.json({ user, total_purchases: purchases.length });
});

app.put('/api/auth/student/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, mobile, branch, year, semester } = req.body;
  const updated = db.updateUser(req.user!.id, { name, mobile, branch, year, semester });
  return res.json({ message: 'Profile updated', user: updated });
});

app.post('/api/auth/student/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email address required' });

  const user = db.findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'No student account registered with this email' });

  return res.json({
    message: 'OTP generated for password recovery',
    demo_otp: '123456'
  });
});

app.post('/api/auth/student/reset-password', (req: Request, res: Response) => {
  const { email, new_password } = req.body;
  if (!email || !new_password) return res.status(400).json({ error: 'Email and new password required' });

  const user = db.findUserByEmail(email);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.updateUser(user.id, { password_hash: hashPassword(new_password) });
  return res.json({ message: 'Password reset successfully' });
});

// Admin Login
app.post('/api/auth/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = db.findAdminByEmail(email);
  if (!admin) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const isValid = comparePassword(password, admin.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid admin credentials.' });
  }

  const token = generateToken({
    id: admin.id,
    email: admin.email,
    role: 'admin',
    name: admin.name
  });

  return res.json({
    message: 'Admin authorization granted',
    token,
    admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role }
  });
});

app.get('/api/auth/admin/profile', requireAdmin, (req: AuthRequest, res: Response) => {
  const admin = db.findAdminById(req.user!.id);
  if (!admin) return res.status(404).json({ error: 'Admin not found' });
  return res.json({ admin });
});

// ==========================================
// 2. ADMIN RESET / DELETE ALL (User Request)
// ==========================================

app.post('/api/admin/wipe-all-courses-and-pdfs', requireAdmin, (_req: Request, res: Response) => {
  const result = db.deleteAllCoursesAndPDFs();
  return res.json(result);
});

app.post('/api/admin/seed-default-template', requireAdmin, (_req: Request, res: Response) => {
  const result = db.resetToDefaultTemplate();
  return res.json(result);
});

// ==========================================
// 3. COURSES API (Classplus Storefront & Admin)
// ==========================================

app.get('/api/courses', optionalAuth, (req: AuthRequest, res: Response) => {
  const { branch, semester, year, search, sort, all } = req.query;
  const isAdmin = req.user?.role === 'admin';

  let courses = db.getCourses(isAdmin && all === 'true');

  if (branch) {
    courses = courses.filter(c => c.branch.toLowerCase().includes((branch as string).toLowerCase()));
  }
  if (semester) {
    courses = courses.filter(c => c.semester === Number(semester));
  }
  if (year) {
    courses = courses.filter(c => c.year.toLowerCase() === (year as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    courses = courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.subtitle.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  if (sort === 'price_asc') {
    courses.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
  } else if (sort === 'price_desc') {
    courses.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
  } else if (sort === 'rating') {
    courses.sort((a, b) => b.rating - a.rating);
  } else {
    courses.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
  }

  // Annotate with total subcourses, folders and pdfs count
  const userId = req.user?.id;
  const response = courses.map(c => {
    const subList = db.getSubcourses(c.id);
    const pdfList = db.getPDFs(undefined, c.id);
    const isEnrolled = userId ? db.hasUserAccessToCourse(userId, c.id) : false;

    return {
      ...c,
      total_subcourses: subList.length,
      total_pdfs: pdfList.length,
      total_pages: pdfList.reduce((sum, p) => sum + (p.total_pages || 0), 0),
      is_enrolled: isEnrolled
    };
  });

  return res.json(response);
});

// Single Course with Full Nested Curriculum Tree (Classplus View)
app.get('/api/courses/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const course = db.findCourseById(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const userId = req.user?.id;
  const isEnrolled = userId ? db.hasUserAccessToCourse(userId, course.id) : false;
  const isAdmin = req.user?.role === 'admin';

  // Subcourses under this course
  const subcourses = db.getSubcourses(course.id).map(sub => {
    // Folders under this subcourse
    const folders = db.getFolders(course.id, sub.id).map(fld => {
      // PDFs inside this folder
      const folderPDFs = db.getPDFs(fld.id).map(pdf => {
        const canAccess = isEnrolled || isAdmin || pdf.is_free_preview || (userId ? db.hasUserAccessToPDF(userId, pdf.id) : false);
        return {
          id: pdf.id,
          title: pdf.title,
          description: pdf.description,
          total_pages: pdf.total_pages,
          file_size: pdf.file_size,
          is_free_preview: pdf.is_free_preview,
          price: pdf.price,
          can_access: canAccess,
          uploaded_at: pdf.uploaded_at
        };
      });

      return {
        id: fld.id,
        name: fld.name,
        parent_folder_id: fld.parent_folder_id,
        order: fld.order,
        pdfs: folderPDFs
      };
    });

    return {
      id: sub.id,
      title: sub.title,
      subject_code: sub.subject_code,
      description: sub.description,
      order: sub.order,
      price: sub.price,
      discount_price: sub.discount_price,
      folders
    };
  });

  const reviews = db.getReviews(course.id);

  return res.json({
    ...course,
    is_enrolled: isEnrolled,
    subcourses,
    reviews
  });
});

// Admin: Create Course
app.post('/api/admin/courses', requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    subtitle,
    branch,
    semester,
    year,
    description,
    features,
    price,
    discount_price,
    validity,
    thumbnail_color
  } = req.body;

  if (!title || !branch || price === undefined) {
    return res.status(400).json({ error: 'Course title, branch, and price are required.' });
  }

  const newCourse: Course = {
    id: `crs_${Date.now()}`,
    title: title.trim(),
    subtitle: subtitle || 'MSBTE Diploma Comprehensive Preparation',
    branch: branch.trim(),
    semester: Number(semester) || 1,
    year: year || '1st Year',
    description: description || '',
    features: Array.isArray(features) ? features : [
      'Comprehensive MSBTE I-Scheme Notes',
      'Step-by-Step Model Answers',
      'Solved Previous Year Papers',
      'Personalized Watermarked PDF Reader'
    ],
    price: Number(price),
    discount_price: discount_price !== undefined && discount_price !== '' ? Number(discount_price) : Number(price),
    is_published: true,
    validity: validity || 'MSBTE Winter/Summer Exam (Lifetime)',
    thumbnail_color: thumbnail_color || 'from-blue-600 via-indigo-600 to-amber-500',
    enrolled_count: 0,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createCourse(newCourse);
  return res.status(201).json(newCourse);
});

// Admin: Update Course (price, description, validity, etc.)
app.put('/api/admin/courses/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateCourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Course not found' });
  return res.json(updated);
});

// Admin: Delete Course
app.delete('/api/admin/courses/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteCourse(req.params.id);
  if (!success) return res.status(404).json({ error: 'Course not found' });
  return res.json({ message: 'Course and all nested content deleted' });
});

// ==========================================
// 4. SUBCOURSES / SUBJECTS API (Classplus)
// ==========================================

app.post('/api/admin/subcourses', requireAdmin, (req: Request, res: Response) => {
  const { course_id, title, subject_code, description, price, discount_price } = req.body;
  if (!course_id || !title) return res.status(400).json({ error: 'Course ID and title required' });

  const newSubcourse: Subcourse = {
    id: `sub_${Date.now()}`,
    course_id,
    title: title.trim(),
    subject_code: subject_code?.trim() || 'MSBTE',
    description: description || '',
    order: db.getSubcourses(course_id).length + 1,
    price: price ? Number(price) : undefined,
    discount_price: discount_price ? Number(discount_price) : undefined,
    is_published: true,
    created_at: new Date().toISOString()
  };

  db.createSubcourse(newSubcourse);
  return res.status(201).json(newSubcourse);
});

app.put('/api/admin/subcourses/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSubcourse(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subcourse not found' });
  return res.json(updated);
});

app.delete('/api/admin/subcourses/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteSubcourse(req.params.id);
  if (!success) return res.status(404).json({ error: 'Subcourse not found' });
  return res.json({ message: 'Subcourse deleted' });
});

// ==========================================
// 5. FOLDERS API (Classplus Nested Explorer)
// ==========================================

app.post('/api/admin/folders', requireAdmin, (req: Request, res: Response) => {
  const { course_id, subcourse_id, parent_folder_id, name } = req.body;
  if (!course_id || !subcourse_id || !name) {
    return res.status(400).json({ error: 'Course ID, Subcourse ID, and Folder Name required.' });
  }

  const newFolder: Folder = {
    id: `fld_${Date.now()}`,
    course_id,
    subcourse_id,
    parent_folder_id: parent_folder_id || null,
    name: name.trim().startsWith('📁') ? name.trim() : `📁 ${name.trim()}`,
    order: db.getFolders(course_id, subcourse_id).length + 1,
    created_at: new Date().toISOString()
  };

  db.createFolder(newFolder);
  return res.status(201).json(newFolder);
});

app.put('/api/admin/folders/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateFolder(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Folder not found' });
  return res.json(updated);
});

app.delete('/api/admin/folders/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deleteFolder(req.params.id);
  if (!success) return res.status(404).json({ error: 'Folder not found' });
  return res.json({ message: 'Folder and nested files deleted' });
});

// ==========================================
// 6. PDF DOCUMENTS API & SECURE VIEWER
// ==========================================

app.post('/api/admin/pdfs', requireAdmin, (req: Request, res: Response) => {
  const {
    course_id,
    subcourse_id,
    folder_id,
    title,
    description,
    is_free_preview,
    price,
    total_pages,
    pages
  } = req.body;

  if (!course_id || !subcourse_id || !folder_id || !title) {
    return res.status(400).json({ error: 'Course, Subcourse, Folder and Document Title required.' });
  }

  let finalPages = pages;
  if (!finalPages || !Array.isArray(finalPages) || finalPages.length === 0) {
    finalPages = [
      {
        page_number: 1,
        title: `${title} - Page 1`,
        subtitle: 'MSBTE Diploma Verified Academic Material',
        content: `### Complete Theory & Key Concepts\n\nSpecially curated for MSBTE board exams:\n- Unit overview and definition breakdown\n- Standard diagrams and comparative tables\n- Step-by-step model answer format for maximum scoring.`,
        highlights: ['Verified by MSBTE Faculty Toppers'],
        formulas: [],
        is_preview: true
      },
      {
        page_number: 2,
        title: 'High Weightage Questions & Solved Problems',
        subtitle: 'Marking Scheme Distribution',
        content: `### Board Exam Important Question Breakdown\n\n1. Explain core principles with neat illustrations (MSBTE 6 Marks).\n2. Solved numerical with given data, step calculations, and final SI units.`,
        highlights: ['High probability predicted question for upcoming winter/summer exam.'],
        formulas: [],
        is_preview: !!is_free_preview
      }
    ];
  }

  const newPDF: PDFDocument = {
    id: `pdf_${Date.now()}`,
    course_id,
    subcourse_id,
    folder_id,
    title: title.trim().endsWith('.pdf') ? title.trim() : `${title.trim()}.pdf`,
    description: description || '',
    total_pages: Number(total_pages) || finalPages.length,
    file_size: `${(Math.random() * 3 + 2.5).toFixed(1)} MB`,
    is_free_preview: Boolean(is_free_preview),
    price: price !== undefined && price !== '' ? Number(price) : undefined,
    is_published: true,
    pages: finalPages,
    download_count: 0,
    uploaded_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.createPDF(newPDF);
  return res.status(201).json(newPDF);
});

app.put('/api/admin/pdfs/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updatePDF(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'PDF Document not found' });
  return res.json(updated);
});

app.delete('/api/admin/pdfs/:id', requireAdmin, (req: Request, res: Response) => {
  const success = db.deletePDF(req.params.id);
  if (!success) return res.status(404).json({ error: 'PDF Document not found' });
  return res.json({ message: 'PDF Document deleted' });
});

// Secure PDF Viewer Endpoint with Dynamic Student Watermarking
app.get('/api/pdfs/:id/view', optionalAuth, (req: AuthRequest, res: Response) => {
  const pdfId = req.params.id;
  const pdf = db.findPDFById(pdfId);

  if (!pdf) {
    return res.status(404).json({ error: 'PDF Document not found.' });
  }

  const userId = req.user?.id;
  const userName = req.user?.name || 'Guest Student';
  const userEmail = req.user?.email || 'preview@diplomarankers.com';
  const isAdmin = req.user?.role === 'admin';

  const hasAccess = isAdmin || (userId ? db.hasUserAccessToPDF(userId, pdfId) : false);

  // If user does not have full access:
  if (!hasAccess) {
    // If it's a free preview document, allow preview pages
    if (pdf.is_free_preview) {
      const previewPages = pdf.pages.filter(p => p.is_preview);
      return res.json({
        id: pdf.id,
        title: pdf.title,
        total_pages: pdf.total_pages,
        pages: previewPages.length > 0 ? previewPages : pdf.pages.slice(0, 1),
        is_preview_mode: true,
        security: {
          watermark_text: 'DIPLOMA RANKERS FREE SAMPLE PREVIEW • PURCHASE COURSE TO UNLOCK ALL PAGES',
          student_name: userName,
          student_email: userEmail
        }
      });
    }

    // Otherwise strictly deny
    return res.status(403).json({
      error: 'Access Denied: You have not enrolled in this course or purchased this PDF.',
      locked: true,
      pdf_id: pdfId,
      title: pdf.title,
      course_id: pdf.course_id
    });
  }

  // User has verified access or is admin! Return complete document with tamper-proof student watermark
  const watermarkText = `LICENSED TO: ${userName.toUpperCase()} (${userEmail}) | DIPLOMA RANKERS SECURE MSBTE PORTAL`;

  return res.json({
    id: pdf.id,
    title: pdf.title,
    total_pages: pdf.total_pages,
    pages: pdf.pages,
    is_preview_mode: false,
    security: {
      watermark_text: watermarkText,
      student_name: userName,
      student_email: userEmail,
      access_timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    }
  });
});

// ==========================================
// 7. CHECKOUT & PAYMENT FLOW (Classplus Style)
// ==========================================

app.post('/api/orders/create', authenticateToken, (req: AuthRequest, res: Response) => {
  const { item_type, item_id, coupon_code } = req.body;

  const userId = req.user!.id;
  const user = db.findUserById(userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let itemTitle = 'MSBTE Diploma Study Content';
  let price = 49;

  if (item_type === 'course') {
    const course = db.findCourseById(item_id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    itemTitle = course.title;
    price = course.discount_price !== undefined ? course.discount_price : course.price;
  } else if (item_type === 'subcourse') {
    const sub = db.findSubcourseById(item_id);
    if (!sub) return res.status(404).json({ error: 'Subject not found' });
    itemTitle = sub.title;
    price = sub.discount_price !== undefined ? sub.discount_price : (sub.price || 20);
  } else if (item_type === 'pdf') {
    const pdf = db.findPDFById(item_id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });
    itemTitle = pdf.title;
    price = pdf.price || 15;
  }

  let discount = 0;
  if (coupon_code) {
    const cp = db.findCouponByCode(coupon_code);
    if (cp && cp.is_active && price >= cp.min_order_value) {
      if (cp.discount_percent) {
        discount = Math.round((price * cp.discount_percent) / 100);
      } else if (cp.discount_fixed) {
        discount = Math.min(cp.discount_fixed, price);
      }
    }
  }

  const finalAmount = Math.max(0, price - discount);
  const orderNumber = `DR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const razorpayOrder = createRazorpayOrderReference(finalAmount, orderNumber);
  const testPaymentId = `pay_sim_${Date.now()}`;
  const testSignature = generatePaymentSignature(razorpayOrder.id, testPaymentId);

  const orderItem: any = {
    id: `item_${Date.now()}`,
    order_id: '',
    item_type: item_type || 'course',
    item_id,
    item_title: itemTitle,
    price
  };

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    order_number: orderNumber,
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    total_amount: price,
    discount_amount: discount,
    final_amount: finalAmount,
    coupon_code,
    payment_gateway: 'razorpay',
    razorpay_order_id: razorpayOrder.id,
    status: 'pending',
    items: [orderItem],
    created_at: new Date().toISOString()
  };

  db.createOrder(newOrder);

  return res.status(201).json({
    order: newOrder,
    razorpay: {
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR',
      key_id: razorpayOrder.key_id,
      user_name: user.name,
      user_email: user.email,
      user_mobile: user.mobile
    },
    simulation_keys: {
      order_id: razorpayOrder.id,
      payment_id: testPaymentId,
      signature: testSignature
    }
  });
});

app.post('/api/orders/verify-payment', authenticateToken, (req: AuthRequest, res: Response) => {
  const {
    order_id,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    simulate_failure
  } = req.body;

  const order = db.findOrderById(order_id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (simulate_failure) {
    db.updateOrder(order.id, { status: 'failed' });
    return res.status(400).json({ success: false, error: 'Payment declined by bank.', order_status: 'failed' });
  }

  const verify = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!verify.success) {
    db.updateOrder(order.id, { status: 'failed' });
    return res.status(400).json({ success: false, error: verify.error });
  }

  // Verified!
  db.updateOrder(order.id, {
    status: 'paid',
    razorpay_payment_id,
    razorpay_signature
  });

  // Record Purchase / Course Enrollment
  for (const it of order.items) {
    db.recordPurchase({
      id: `pur_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user_id: order.user_id,
      item_type: it.item_type,
      item_id: it.item_id,
      order_id: order.id,
      purchased_at: new Date().toISOString(),
      access_revoked: false
    });
  }

  return res.json({
    success: true,
    message: 'Payment verified! All course materials and PDFs unlocked.',
    order_number: order.order_number,
    amount_paid: order.final_amount
  });
});

// Student's My Purchases / Enrolled Courses
app.get('/api/purchases/my-purchases', authenticateToken, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const purchases = db.getPurchasesByUserId(userId);

  const results = purchases.map(p => {
    let title = 'Study Material';
    let subtitle = '';
    let totalPdfs = 0;

    if (p.item_type === 'course') {
      const crs = db.findCourseById(p.item_id);
      title = crs?.title || 'Enrolled Course';
      subtitle = `${crs?.branch || ''} • Sem ${crs?.semester || ''}`;
      totalPdfs = db.getPDFs(undefined, p.item_id).length;
    } else if (p.item_type === 'pdf') {
      const pdf = db.findPDFById(p.item_id);
      title = pdf?.title || 'PDF Document';
      subtitle = `${pdf?.total_pages || 0} Pages`;
    }

    return {
      purchase_id: p.id,
      item_type: p.item_type,
      item_id: p.item_id,
      title,
      subtitle,
      total_pdfs: totalPdfs,
      purchased_at: p.purchased_at
    };
  });

  return res.json(results);
});

// Admin Analytics
app.get('/api/admin/analytics', requireAdmin, (_req: Request, res: Response) => {
  const users = db.getRawData().users;
  const courses = db.getRawData().courses;
  const subcourses = db.getRawData().subcourses;
  const pdfs = db.getRawData().pdfs;
  const orders = db.getOrders();

  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.final_amount, 0);

  return res.json({
    total_students: users.length,
    total_courses: courses.length,
    total_subcourses: subcourses.length,
    total_pdfs: pdfs.length,
    total_orders: orders.length,
    successful_payments: paidOrders.length,
    total_revenue: totalRevenue,
    courses: courses.map(c => ({
      id: c.id,
      title: c.title,
      price: c.discount_price ?? c.price,
      enrolled: c.enrolled_count
    }))
  });
});

// Admin Student Management & Access Grants (Classplus standard feature)
app.get('/api/admin/students', requireAdmin, (_req: Request, res: Response) => {
  const students = db.getUsers();
  const allPurchases = db.getRawData().purchases;
  const courses = db.getCourses(true);

  const studentsWithAccess = students.map(s => {
    const studentPurchases = allPurchases.filter(p => p.user_id === s.id && !p.access_revoked);
    const enrolledCourseNames = studentPurchases.map(p => {
      if (p.item_type === 'course') {
        const crs = courses.find(c => c.id === p.item_id);
        return crs?.title || 'Course';
      }
      return p.item_type.toUpperCase();
    });

    return {
      ...s,
      enrolled_count: studentPurchases.length,
      enrolled_courses: enrolledCourseNames,
      purchases: studentPurchases
    };
  });

  return res.json(studentsWithAccess);
});

app.post('/api/admin/grant-access', requireAdmin, (req: Request, res: Response) => {
  const { user_id, item_type, item_id } = req.body;
  if (!user_id || !item_id) {
    return res.status(400).json({ error: 'Student ID and Item ID are required.' });
  }

  const user = db.findUserById(user_id);
  if (!user) return res.status(404).json({ error: 'Student not found.' });

  const purchase = db.grantStudentAccess(user_id, item_type || 'course', item_id);
  return res.json({
    success: true,
    message: `Full access granted to ${user.name} for ${item_type || 'course'}.`,
    purchase
  });
});

app.post('/api/admin/revoke-access', requireAdmin, (req: Request, res: Response) => {
  const { user_id, item_id } = req.body;
  if (!user_id || !item_id) {
    return res.status(400).json({ error: 'Student ID and Item ID are required.' });
  }

  const revoked = db.revokeStudentAccess(user_id, item_id);
  if (!revoked) {
    return res.status(404).json({ error: 'No active enrollment found for this student and item.' });
  }
  return res.json({ success: true, message: 'Access successfully revoked.' });
});

// Coupons
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, cart_total } = req.body;
  const cp = db.findCouponByCode(code);
  if (!cp || !cp.is_active) return res.status(404).json({ error: 'Invalid coupon' });

  const total = Number(cart_total) || 0;
  if (total < cp.min_order_value) {
    return res.status(400).json({ error: `Min order ₹${cp.min_order_value} required` });
  }

  const discount = cp.discount_percent ? Math.round((total * cp.discount_percent) / 100) : (cp.discount_fixed || 0);
  return res.json({ valid: true, code: cp.code, discount_amount: discount, message: `Coupon ${cp.code} applied! Saved ₹${discount}` });
});

app.get('/api/notifications', (_req: Request, res: Response) => {
  return res.json(db.getNotifications());
});

app.get('/api/branches', (_req: Request, res: Response) => {
  return res.json(db.getBranches());
});

// Catch-all 404 for unhandled API endpoints
app.all('/api/*', (req: Request, res: Response) => {
  return res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ==========================================
// 8. STATIC & SPA SERVING (Zero 404s guaranteed)
// ==========================================

async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const distIndexHtml = path.resolve(distPath, 'index.html');
  const hasDist = fs.existsSync(distIndexHtml);

  if (isProduction && hasDist) {
    // Production mode with compiled dist
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      res.sendFile(distIndexHtml);
    });
  } else {
    // Development mode OR production fallback before dist build
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) return next();
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace?.(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Diploma Rankers Classplus Platform] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
});
