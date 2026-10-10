import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { 
  Course, 
  CourseCategory, 
  CourseModule, 
  CourseLesson, 
  CourseEnrollment, 
  CourseLessonProgress, 
  CourseCertificate, 
  Subscription, 
  Plan, 
  User, 
  AuditLog 
} from '../models/index';
import { Op } from 'sequelize';

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, difficulty, accessType, search } = req.query;
    const where: any = { status: 'PUBLISHED' };

    if (category) {
      const cat = await CourseCategory.findOne({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (difficulty) where.difficulty = difficulty;
    if (accessType) where.accessType = accessType;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { shortDescription: { [Op.like]: `%${search}%` } },
      ];
    }

    const courses = await Course.findAll({
      where,
      include: [
        { model: CourseCategory, attributes: ['id', 'name', 'slug', 'icon'] },
        { 
          model: CourseModule, 
          attributes: ['id', 'title'],
          include: [{ model: CourseLesson, attributes: ['id', 'title', 'durationMinutes', 'isPreview'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch courses' });
  }
};

export const getCourseCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await CourseCategory.findAll({
      where: { isActive: true },
      order: [['orderIndex', 'ASC']],
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch course categories' });
  }
};

export const getCourseBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const authHeader = req.headers.authorization;
    let userId: number | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026';
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (e) {}
    }

    const course = await Course.findOne({
      where: { slug },
      include: [
        { model: CourseCategory },
        {
          model: CourseModule,
          order: [['orderIndex', 'ASC']],
          include: [
            {
              model: CourseLesson,
              order: [['orderIndex', 'ASC']],
            },
          ],
        },
      ],
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    let isEnrolled = false;
    let enrollment: any = null;

    if (userId) {
      enrollment = await CourseEnrollment.findOne({
        where: { userId, courseId: course.id },
      });
      if (enrollment) isEnrolled = true;
    }

    res.json({
      course,
      isEnrolled,
      enrollment,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch course details' });
  }
};

export const enrollCourse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: courseId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    // Check if already enrolled
    const existing = await CourseEnrollment.findOne({
      where: { userId, courseId: course.id },
    });

    if (existing) {
      res.json({ message: 'Already enrolled', enrollment: existing });
      return;
    }

    // Check if course is free or tier unlocked
    let canEnroll = course.accessType === 'FREE';

    if (!canEnroll && course.accessType === 'SUBSCRIPTION_ONLY' || course.accessType === 'TIER_RESTRICTED') {
      const activeSub = await Subscription.findOne({
        where: { userId, status: 'ACTIVE' },
        include: [{ model: Plan }],
      });

      if (activeSub && activeSub.Plan) {
        const tier = activeSub.Plan.accessTier;
        if (course.requiredTier === 'BASIC') canEnroll = true;
        else if (course.requiredTier === 'PREMIUM' && (tier === 'PREMIUM' || tier === 'VIP')) canEnroll = true;
        else if (course.requiredTier === 'VIP' && tier === 'VIP') canEnroll = true;
      }
    }

    if (!canEnroll && course.accessType === 'PAID') {
      res.status(402).json({ 
        error: 'Payment required to enroll in this course. Please complete checkout.',
        requiresPayment: true,
      });
      return;
    }

    const enrollment = await CourseEnrollment.create({
      userId,
      courseId: course.id,
      progressPercentage: 0,
    });

    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to enroll in course' });
  }
};

export const getMyCourses = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const enrollments = await CourseEnrollment.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          include: [{ model: CourseCategory }],
        },
      ],
      order: [['enrolledAt', 'DESC']],
    });

    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch my courses' });
  }
};

export const getCourseProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: courseId } = req.params;

    const enrollment = await CourseEnrollment.findOne({
      where: { userId, courseId },
      include: [{ model: Course }],
    });

    if (!enrollment) {
      res.status(404).json({ error: 'You are not enrolled in this course' });
      return;
    }

    // Fetch all lessons for this course
    const modules = await CourseModule.findAll({
      where: { courseId },
      include: [{ model: CourseLesson }],
    });

    const lessonIds = modules.flatMap(m => (m.CourseLessons || []).map(l => l.id));

    const progressRecords = await CourseLessonProgress.findAll({
      where: {
        userId,
        lessonId: { [Op.in]: lessonIds },
      },
    });

    const completedLessonIds = progressRecords.filter(p => p.isCompleted).map(p => p.lessonId);

    res.json({
      enrollment,
      completedLessonIds,
      totalLessons: lessonIds.length,
      completedCount: completedLessonIds.length,
      progressPercentage: Number(enrollment.progressPercentage),
      certificateId: enrollment.certificateId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch course progress' });
  }
};

export const completeLesson = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id: courseId, lessonId } = req.params;

    const course = await Course.findByPk(courseId);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    let enrollment = await CourseEnrollment.findOne({ where: { userId, courseId } });
    if (!enrollment) {
      // Auto enroll if not enrolled
      enrollment = await CourseEnrollment.create({
        userId,
        courseId: Number(courseId),
        progressPercentage: 0,
      });
    }

    // Upsert lesson progress
    let progress = await CourseLessonProgress.findOne({ where: { userId, lessonId } });
    if (!progress) {
      progress = await CourseLessonProgress.create({
        userId,
        lessonId: Number(lessonId),
        isCompleted: true,
        completedAt: new Date(),
      });
    } else {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    // Recalculate total course progress
    const modules = await CourseModule.findAll({
      where: { courseId },
      include: [{ model: CourseLesson }],
    });

    const allLessonIds = modules.flatMap(m => (m.CourseLessons || []).map(l => l.id));
    const totalLessons = allLessonIds.length;

    const completedRecords = await CourseLessonProgress.findAll({
      where: {
        userId,
        lessonId: { [Op.in]: allLessonIds },
        isCompleted: true,
      },
    });

    const completedCount = completedRecords.length;
    const progressPct = totalLessons > 0 ? Number(((completedCount / totalLessons) * 100).toFixed(2)) : 100;

    enrollment.progressPercentage = progressPct;

    // Issue Certificate if 100% completed
    if (progressPct >= 100 && !enrollment.certificateId) {
      const user = await User.findByPk(userId);
      const certId = `CERT-AKASH-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      await CourseCertificate.create({
        certificateId: certId,
        userId,
        courseId: course.id,
        studentName: user?.fullName || 'Valued Trader',
        courseTitle: course.title,
        instructor: course.instructor,
        issueDate: new Date(),
      });

      enrollment.certificateId = certId;
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    res.json({
      success: true,
      progressPercentage: progressPct,
      isCompleted: progressPct >= 100,
      certificateId: enrollment.certificateId,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update lesson progress' });
  }
};

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;
    const certificate = await CourseCertificate.findOne({
      where: { certificateId },
      include: [{ model: Course }],
    });

    if (!certificate) {
      res.status(404).json({ error: 'Certificate not found or invalid ID' });
      return;
    }

    res.json({
      valid: true,
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      instructor: certificate.instructor,
      issueDate: certificate.issueDate,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to verify certificate' });
  }
};

// ============================================================================
// ADMIN COURSE MANAGEMENT
// ============================================================================

export const createCourseAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      categoryId,
      title,
      slug,
      shortDescription,
      description,
      thumbnailUrl,
      instructor = 'Scalper Akash',
      difficulty = 'ALL_LEVELS',
      durationMinutes = 120,
      price = 0.00,
      discountPrice,
      accessType = 'PAID',
      requiredTier = 'BASIC',
      status = 'PUBLISHED',
      modules = [],
    } = req.body;

    const courseSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const course = await Course.create({
      categoryId,
      title,
      slug: courseSlug,
      shortDescription,
      description,
      thumbnailUrl,
      instructor,
      difficulty,
      durationMinutes,
      price,
      discountPrice,
      accessType,
      requiredTier,
      status,
    });

    // Create modules and lessons if provided
    if (modules && Array.isArray(modules)) {
      for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        const createdMod = await CourseModule.create({
          courseId: course.id,
          title: mod.title,
          description: mod.description,
          orderIndex: i + 1,
        });

        if (mod.lessons && Array.isArray(mod.lessons)) {
          for (let j = 0; j < mod.lessons.length; j++) {
            const les = mod.lessons[j];
            await CourseLesson.create({
              moduleId: createdMod.id,
              title: les.title,
              slug: les.slug || les.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              description: les.description,
              videoUrl: les.videoUrl,
              durationMinutes: les.durationMinutes || 15,
              isPreview: !!les.isPreview,
              orderIndex: j + 1,
              resources: les.resources || [],
              quizData: les.quizData || [],
            });
          }
        }
      }
    }

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COURSE_CREATED',
      resource: 'courses',
      previousValue: null,
      newValue: JSON.stringify({ courseId: course.id, title }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.status(201).json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create course' });
  }
};

export const updateCourseAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await course.update(req.body);

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COURSE_UPDATED',
      resource: 'courses',
      previousValue: null,
      newValue: JSON.stringify({ courseId: id, updates: req.body }),
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json(course);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update course' });
  }
};

export const deleteCourseAdmin = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      res.status(404).json({ error: 'Course not found' });
      return;
    }

    await course.destroy();

    await AuditLog.create({
      userId: req.user!.id,
      action: 'COURSE_DELETED',
      resource: 'courses',
      previousValue: JSON.stringify({ courseId: id, title: course.title }),
      newValue: null,
      ipAddress: req.ip || '127.0.0.1',
    });

    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete course' });
  }
};

export const getAdminCourseAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const totalCourses = await Course.count();
    const totalEnrollments = await CourseEnrollment.count();
    const completedEnrollments = await CourseEnrollment.count({ where: { progressPercentage: 100 } });
    const certificatesIssued = await CourseCertificate.count();

    const courses = await Course.findAll({
      include: [{ model: CourseEnrollment }],
    });

    const courseStats = courses.map(c => ({
      id: c.id,
      title: c.title,
      price: c.price,
      accessType: c.accessType,
      enrollments: (c as any).CourseEnrollments?.length || 0,
      completions: (c as any).CourseEnrollments?.filter((e: any) => Number(e.progressPercentage) === 100).length || 0,
    }));

    res.json({
      totalCourses,
      totalEnrollments,
      completedEnrollments,
      certificatesIssued,
      completionRate: totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      courseStats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch course analytics' });
  }
};
